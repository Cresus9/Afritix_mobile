const { createClient } = require('@supabase/supabase-js');

// Get Supabase configuration
const supabaseUrl = 'https://uwmlagvsivxqocklxbbo.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY_DEV;

if (!supabaseAnonKey) {
  console.error('Missing SUPABASE_ANON_KEY_DEV environment variable');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('Checking event_categories table...\n');

  // Check event_categories table
  const { data: categories, error: categoriesError } = await supabase
    .from('event_categories')
    .select('*');
  
  console.log('Event Categories table:');
  if (categoriesError) {
    console.error('Error:', categoriesError.message);
    if (categoriesError.message.includes('does not exist')) {
      console.log('\nThe event_categories table needs to be created.');
    }
  } else {
    console.log('Found', categories?.length, 'categories');
    console.log(JSON.stringify(categories, null, 2));
  }
}

checkDatabase().catch(console.error); 