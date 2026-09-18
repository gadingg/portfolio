const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');

function loadLocalEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[2].startsWith('#') || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
}

loadLocalEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!url || !publicKey || !serviceKey) {
  console.error('Missing Supabase URL, public key, or server-only service key.');
  process.exit(1);
}

const options = { auth: { autoRefreshToken: false, persistSession: false } };
const publicClient = createClient(url, publicKey, options);
const serviceClient = createClient(url, serviceKey, options);
const auditId = randomUUID();
let failures = 0;

function pass(label) {
  console.log(`PASS ${label}`);
}

function fail(label, detail) {
  failures += 1;
  console.error(`FAIL ${label}: ${detail}`);
}

async function expectBlocked(label, operation, cleanup) {
  const result = await operation();
  if (result.error) {
    pass(label);
    return;
  }

  fail(label, 'mutation unexpectedly succeeded');
  if (cleanup) {
    const cleanupResult = await cleanup();
    if (cleanupResult?.error) fail(`${label} cleanup`, cleanupResult.error.message);
  }
}

async function rowExists(table, column, value) {
  const { data, error } = await serviceClient.from(table).select(column).eq(column, value).maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

async function testBrowserRole(client, role) {
  const roleId = randomUUID();
  const roleSlug = `security-audit-${role}-${roleId}`;
  const project = {
    id: roleId,
    title: 'Security audit',
    slug: roleSlug,
    description: 'Temporary security audit row',
    category: 'AUDIT',
    cover_image_url: 'https://example.com/audit.jpg',
    status: 'draft',
    is_featured: false,
    display_order: 0,
  };

  await expectBlocked(
    `${role} project insert`,
    () => client.from('portfolio_projects').insert(project),
    () => serviceClient.from('portfolio_projects').delete().eq('id', roleId)
  );

  const protectedId = randomUUID();
  const protectedTitle = `Protected ${role} audit row`;
  const { error: setupError } = await serviceClient.from('portfolio_projects').insert({
    ...project,
    id: protectedId,
    title: protectedTitle,
    slug: `${roleSlug}-protected`,
  });
  if (setupError) {
    fail(`${role} update/delete setup`, setupError.message);
  } else {
    const { data: visibleDrafts, error: draftReadError } = await client
      .from('portfolio_projects')
      .select('id')
      .eq('id', protectedId);
    if (draftReadError) fail(`${role} draft visibility`, draftReadError.message);
    else if (visibleDrafts.length) fail(`${role} draft visibility`, 'draft row was visible');
    else pass(`${role} draft visibility`);

    await client.from('portfolio_projects').update({ title: 'Mutated by browser role' }).eq('id', protectedId);
    const { data: afterUpdate, error: updateCheckError } = await serviceClient
      .from('portfolio_projects')
      .select('title')
      .eq('id', protectedId)
      .single();
    if (updateCheckError) fail(`${role} project update`, updateCheckError.message);
    else if (afterUpdate.title !== protectedTitle) fail(`${role} project update`, 'protected row changed');
    else pass(`${role} project update`);

    await client.from('portfolio_projects').delete().eq('id', protectedId);
    if (await rowExists('portfolio_projects', 'id', protectedId)) pass(`${role} project delete`);
    else fail(`${role} project delete`, 'protected row was deleted');
    await serviceClient.from('portfolio_projects').delete().eq('id', protectedId);
  }

  await expectBlocked(
    `${role} CMS project RPC`,
    () => client.rpc('save_portfolio_project', {
      project_data: { ...project, id: undefined },
      blocks_data: [],
    }),
    () => serviceClient.from('portfolio_projects').delete().eq('slug', roleSlug)
  );

  const galleryId = `security-audit-${role}-${roleId}`;
  await expectBlocked(
    `${role} gallery insert`,
    () => client.from('portfolio_gallery').insert({
      id: galleryId,
      url: 'https://example.com/audit.jpg',
      display_order: 0,
    }),
    () => serviceClient.from('portfolio_gallery').delete().eq('id', galleryId)
  );

  const protectedGalleryId = `security-audit-${role}-${roleId}-protected`;
  const protectedGalleryCaption = `Protected ${role} gallery row`;
  const { error: gallerySetupError } = await serviceClient.from('portfolio_gallery').insert({
    id: protectedGalleryId,
    url: 'https://example.com/audit.jpg',
    caption: protectedGalleryCaption,
    display_order: 0,
  });
  if (gallerySetupError) {
    fail(`${role} gallery update/delete setup`, gallerySetupError.message);
  } else {
    await client.from('portfolio_gallery').update({ caption: 'Mutated by browser role' }).eq('id', protectedGalleryId);
    const { data: afterGalleryUpdate, error: galleryUpdateCheckError } = await serviceClient
      .from('portfolio_gallery')
      .select('caption')
      .eq('id', protectedGalleryId)
      .single();
    if (galleryUpdateCheckError) fail(`${role} gallery update`, galleryUpdateCheckError.message);
    else if (afterGalleryUpdate.caption !== protectedGalleryCaption) fail(`${role} gallery update`, 'protected row changed');
    else pass(`${role} gallery update`);

    await client.from('portfolio_gallery').delete().eq('id', protectedGalleryId);
    if (await rowExists('portfolio_gallery', 'id', protectedGalleryId)) pass(`${role} gallery delete`);
    else fail(`${role} gallery delete`, 'protected row was deleted');
    await serviceClient.from('portfolio_gallery').delete().eq('id', protectedGalleryId);
  }

  const galleryRpc = await client.rpc('replace_portfolio_gallery', { gallery_data: {} });
  if (!galleryRpc.error) {
    fail(`${role} gallery RPC`, 'RPC unexpectedly accepted a non-array payload');
  } else if (galleryRpc.error.message.includes('gallery_data must be an array')) {
    fail(`${role} gallery RPC`, 'browser role was able to execute the function');
  } else {
    pass(`${role} gallery RPC`);
  }

  const uploadPath = `security-audit/${role}-${roleId}.txt`;
  await expectBlocked(
    `${role} Storage upload`,
    () => client.storage.from('portfolio-public').upload(uploadPath, Buffer.from('audit'), {
      contentType: 'text/plain',
      upsert: false,
    }),
    () => serviceClient.storage.from('portfolio-public').remove([uploadPath])
  );

  const protectedPath = `security-audit/${role}-${roleId}-protected.txt`;
  const { error: storageSetupError } = await serviceClient.storage
    .from('portfolio-public')
    .upload(protectedPath, Buffer.from('protected'), { contentType: 'text/plain', upsert: false });
  if (storageSetupError) {
    fail(`${role} Storage update/delete setup`, storageSetupError.message);
  } else {
    const readResult = await client.storage.from('portfolio-public').download(protectedPath);
    if (readResult.error) fail(`${role} Storage read`, readResult.error.message);
    else pass(`${role} Storage read`);

    const updateResult = await client.storage
      .from('portfolio-public')
      .upload(protectedPath, Buffer.from('mutated'), { contentType: 'text/plain', upsert: true });
    if (updateResult.error) pass(`${role} Storage update`);
    else fail(`${role} Storage update`, 'protected object was overwritten');

    const deleteResult = await client.storage.from('portfolio-public').remove([protectedPath]);
    if (deleteResult.error) {
      pass(`${role} Storage delete`);
    } else {
      const { data: remaining, error: listError } = await serviceClient.storage
        .from('portfolio-public')
        .list('security-audit', { search: `${role}-${roleId}-protected.txt` });
      if (listError) fail(`${role} Storage delete`, listError.message);
      else if (remaining.length) pass(`${role} Storage delete`);
      else fail(`${role} Storage delete`, 'protected object was deleted');
    }
    await serviceClient.storage.from('portfolio-public').remove([protectedPath]);
  }
}

async function run() {
  const { error: serviceReadError } = await serviceClient
    .from('portfolio_projects')
    .select('id', { head: true, count: 'exact' });
  if (serviceReadError) fail('service-role table access', serviceReadError.message);
  else pass('service-role table access');

  const { error: publicReadError } = await publicClient
    .from('portfolio_projects')
    .select('id')
    .eq('status', 'published')
    .limit(1);
  if (publicReadError) fail('public published-project reads', publicReadError.message);
  else pass('public published-project reads');

  const { data: drafts, error: draftLookupError } = await serviceClient
    .from('portfolio_projects')
    .select('id')
    .eq('status', 'draft')
    .limit(1);
  if (draftLookupError) {
    fail('draft visibility setup', draftLookupError.message);
  } else if (drafts.length) {
    const { data, error } = await publicClient.from('portfolio_projects').select('id').eq('id', drafts[0].id);
    if (error) fail('draft rows hidden from public role', error.message);
    else if (data.length) fail('draft rows hidden from public role', 'draft row was visible');
    else pass('draft rows hidden from public role');
  } else {
    console.log('SKIP draft rows hidden from public role: no draft exists');
  }

  await testBrowserRole(publicClient, 'anonymous');

  const authEmail = `security-audit-${auditId}@example.invalid`;
  const authPassword = `Audit-${randomUUID()}-aA1!`;
  const { data: createdUser, error: createUserError } = await serviceClient.auth.admin.createUser({
    email: authEmail,
    password: authPassword,
    email_confirm: true,
  });
  if (createUserError || !createdUser.user) {
    fail('authenticated-role setup', createUserError?.message || 'temporary user was not created');
  } else {
    const authenticatedClient = createClient(url, publicKey, options);
    try {
      const { error: signInError } = await authenticatedClient.auth.signInWithPassword({
        email: authEmail,
        password: authPassword,
      });
      if (signInError) fail('authenticated-role setup', signInError.message);
      else await testBrowserRole(authenticatedClient, 'authenticated');
    } finally {
      await authenticatedClient.auth.signOut();
      const { error: deleteUserError } = await serviceClient.auth.admin.deleteUser(createdUser.user.id);
      if (deleteUserError) fail('temporary Auth user cleanup', deleteUserError.message);
    }
  }

  const rpcProbe = await serviceClient.rpc('save_portfolio_project', {
    project_data: { id: randomUUID() },
    blocks_data: [],
  });
  if (rpcProbe.error?.message.includes('Project not found')) pass('service-role CMS project RPC access');
  else fail('service-role CMS project RPC access', rpcProbe.error?.message || 'unexpected RPC result');

  const galleryRpcProbe = await serviceClient.rpc('replace_portfolio_gallery', { gallery_data: {} });
  if (galleryRpcProbe.error?.message.includes('gallery_data must be an array')) {
    pass('service-role CMS gallery RPC access');
  } else {
    fail('service-role CMS gallery RPC access', galleryRpcProbe.error?.message || 'unexpected RPC result');
  }

  if (failures) {
    console.error(`\nSecurity audit failed with ${failures} issue(s).`);
    process.exitCode = 1;
  } else {
    console.log('\nSupabase security audit passed.');
  }
}

run().catch((error) => {
  console.error('Security audit could not complete:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
