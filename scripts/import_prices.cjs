const fs = require('fs');
const path = require('path');

const csvPath = path.join(process.cwd(), 'data_import.csv');

function parseCSV(content) {
    const lines = content.split('\n');
    let headerIndex = -1;
    let headers = [];
    const data = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple split by comma
        // NOTE: If data contains commas, this breaks. 
        // Based on snippet: "MANTECA DE CACAO 25G" etc. seems safe.
        const columns = line.split(',');

        // Detect header row by looking for specific known column
        if (headerIndex === -1 && columns.some(c => c.trim() === 'Codigo de Barra')) {
            headerIndex = i;
            headers = columns.map(c => c.trim());
            // console.log('-- Header found at line ' + (i + 1));
            continue;
        }

        if (headerIndex > -1) {
            const row = {};
            columns.forEach((col, index) => {
                const header = headers[index];
                if (header) {
                    row[header] = col.trim();
                }
            });
            data.push(row);
        }
    }
    return data;
}

try {
    if (!fs.existsSync(csvPath)) {
        console.error('File not found:', csvPath);
        process.exit(1);
    }

    const fileContent = fs.readFileSync(csvPath, 'utf8');
    const records = parseCSV(fileContent);

    console.log('BEGIN;');

    let updateCount = 0;

    records.forEach(record => {
        const barcode = record['Codigo de Barra'];
        const sku = record['Codigo Interno Proveedor'];

        // Headers from user snippet
        // "Precio cobeca $ hoy" (Col G/H)
        // "PRECIO NENA$" (Col H/I)
        // "Precio de contado a farmacias..." (Last col)

        const priceCobecaStr = record['Precio cobeca $ hoy'];
        const priceDronenaStr = record['PRECIO NENA$'];
        const priceStr = record['Precio de contado a farmacias que no estan en cobeca o nena O ESTAN BLOQUEADAS'];

        const cleanPrice = (str) => {
            if (!str || str.toLowerCase() === 'no disp' || str === '') return null;
            const val = parseFloat(str);
            return isNaN(val) ? null : val;
        };

        const priceCobeca = cleanPrice(priceCobecaStr);
        const priceDronena = cleanPrice(priceDronenaStr);
        const price = cleanPrice(priceStr);

        if (barcode) {
            let setParts = [];
            if (priceCobeca !== null) setParts.push(`price_cobeca = ${priceCobeca}`);
            if (priceDronena !== null) setParts.push(`price_dronena = ${priceDronena}`);
            if (price !== null) setParts.push(`price = ${price}`); // Careful if price is Base Price
            if (sku) setParts.push(`sku = '${sku}'`);

            if (setParts.length > 0) {
                console.log(`UPDATE products SET ${setParts.join(', ')} WHERE product_code = '${barcode}';`);
                updateCount++;
            }
        }
    });
    console.log('COMMIT;');
    // console.log(`-- Generated ${updateCount} updates.`);

} catch (err) {
    console.error('Error:', err);
}
