import { processVoiceIntent } from '../services/VoiceActionService';

async function testVoiceActions() {
    console.log('--- TESTING VOICE ACTION CONTROLLER ---');
    
    // Mock user ID (replace with a real one from DB if needed for live test)
    const mockUserId = '1d87e1f4-386b-4e6f-96a2-e2ea7c012543'; 

    const testCases = [
        "Agendar una cita con el Doctor Perez",
        "Por favor programa una visita con la farmacia saas",
        "Necesito tomar un pedido para Central Madeirense",
        "Hola, quiero agendar una visita con el Dr. Garcia para mañana",
        "Tomar orden de compra para Drogueria Maracaibo"
    ];

    for (const transcript of testCases) {
        console.log(`\nInput: "${transcript}"`);
        const result = await processVoiceIntent(transcript, mockUserId);
        console.log(`Intent detected: ${result.intent}`);
        console.log(`Success: ${result.success}`);
        console.log(`Message: ${result.message}`);
        if (result.data) console.log(`Data:`, result.data);
    }
}

testVoiceActions();
