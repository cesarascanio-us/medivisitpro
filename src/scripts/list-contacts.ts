import { supabase } from '../integrations/supabase/client';

async function listContacts() {
    const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Contacts:', data);
}

listContacts();
