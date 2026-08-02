const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const workbook = XLSX.readFile(path.resolve('Preguntas y Respuestas Medicos sobre Productos BIOFARCO.xlsx'));
const allSheetNames = workbook.SheetNames;
console.log('Total Sheets:', allSheetNames.length);

function normalizeName(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findSheet(targetName) {
  const normTarget = normalizeName(targetName);
  // Direct exact match
  if (workbook.Sheets[targetName]) return { name: targetName, sheet: workbook.Sheets[targetName] };
  // Normalized match
  for (const sName of allSheetNames) {
    const norm = normalizeName(sName);
    if (norm === normTarget || norm.includes(normTarget) || normTarget.includes(norm)) {
      return { name: sName, sheet: workbook.Sheets[sName] };
    }
  }
  return null;
}

const PRODUCT_IMAGE_MAP = {
  'neuro vital kid': '/products/NeuroVitalKids.png',
  'neuro vital': '/products/NeuroVital.png',
  'vitacon b': '/products/VitaconB.png',
  'vitacon c': '/products/VitaconC.png',
  'vitapetit': '/products/Vitapetit.png',
  'zincosol': '/products/Zincosol.png',
  'calzinc d': '/products/CalzincD.png',
  'calzinc': '/products/CalzincD.png',
  'emulsión': '/products/Emulsion.png',
  'emulsion': '/products/Emulsion.png',
  'crema para pañalitis': '/products/PastaAgua.png',
  'crema para panalitis': '/products/PastaAgua.png',
  'kurd & care': '/products/Kurd&Care.png',
  'kurd and care': '/products/Kurd&Care.png',
  'probiolitos': '/products/Probiolitos.png',
  'probiocon zinc': '/products/ProbioconZinc.png',
  'hydroral': '/products/Hydroral.png',
  'hydroral pro': '/products/HydroralPro.png',
  'acetaclor': '/products/Acetaclor.png',
  'acetafen': '/products/Acetafen.png',
  'acetafen forte': '/products/Acetafen.png',
  'acetaten forte': '/products/Acetafen.png',
  'acetaten': '/products/Acetafen.png',
  'jarabe de berro': '/products/JarabeBerro.png',
  'jengibre': '/products/Jengibre.png',
  'jengibre zinc vit c': '/products/Jengibre.png',
  'jengibre zinc vitamina c': '/products/Jengibre.png',
  'mentol crema': '/products/MentolCrema.png',
  'pomada mentolada': '/products/MentolCrema.png',
  'mentol rollon': '/products/MentolRollon.png',
  'mentol spray': '/products/MentolSpray.png',
  'mentol': '/products/MentolSpray.png',
  'citrato de potasio': '/products/Citrato.png',
  'cloruro de magnesio': '/products/Cloruro.png',
  'feryfol': '/products/Feryfol.png',
  'leche de magnesia': '/products/LecheMagnesia.png',
  'limonada laxante': '/products/LimonadaLaxante.png',
  'nemozol': '/products/Nemazol.png',
  'nemazol': '/products/Nemazol.png',
  'sal de epsom higuera': '/products/SalEpsom.png',
  'sal de epsom': '/products/SalEpsom.png',
  'urisoft': '/products/Urisoft.png',
  'pasta al agua': '/products/PastaAgua.png',
  'calamina': '/products/Calamina.png',
  'loción calamina': '/products/Calamina.png',
  'locion calamina': '/products/Calamina.png',
  'talco boricado': '/products/TalcoBoricado.png',
  'neutrox': '/products/NeutroX.png',
  'vaselina': '/products/VaselinaTarro.png',
  'glicerina': '/products/Glicerina.png',
  'glicerina usp': '/products/Glicerina.png',
  'aceite de almendras': '/products/AceiteAlmendras.png',
  'aceite de almendras dulces': '/products/AceiteAlmendras.png',
  'aceite de coco': '/products/AceiteCoco.png',
  'aceite mineral': '/products/AceiteMineral.png',
  'aceite de ricino': '/products/AceiteRicino.png',
  'colodion': '/products/Colodion.png',
  'alcohol absoluto': '/products/AlcoholAbsoluto.png',
  'alcohol antiséptico': '/products/AlcoholAnticeptico.png',
  'alcohol antiseptico': '/products/AlcoholAnticeptico.png',
  'alcohol yodado': '/products/AlcoholYodado.png',
  'azufre': '/products/Azufre.png',
  'azufre en polvo': '/products/Azufre.png',
  'azul de metileno': '/products/AzulMetileno.png',
  'violeta de genciana': '/products/VioletaGenciana.png',
  'ácido bórico': '/products/AcidoBorico.png',
  'acido borico': '/products/AcidoBorico.png',
  'cápsulas ácido bórico': '/products/AcidoBorico.png',
  'capsulas de acido borico': '/products/AcidoBorico.png',
  'miel de borax': '/products/MielBorax.png'
};

function getImgForProduct(name) {
  const norm = normalizeName(name);
  for (const [k, v] of Object.entries(PRODUCT_IMAGE_MAP)) {
    const normK = normalizeName(k);
    if (norm === normK || norm.includes(normK) || normK.includes(norm)) {
      return v;
    }
  }
  return null;
}

const THERAPEUTIC_LINES = [
  {
    slug_id: 'sys_line_pediatria',
    title: 'Línea Pediátrica & Nutricional: Farmacología, Posología y Objeciones',
    description: 'Certificación técnica integral en el portafolio pediátrico de BIOFARCO: Neuro Vital Kid, Vitapetit, Vitacon B, Vitacon C, Zincosol, Calzinc D, Emulsión Multivitamínica y Crema para Pañalitis. Manejo de objeciones médicas pediátricas.',
    category: 'Pediatría y Nutrición',
    points_reward: 350,
    duration_mins: 45,
    difficulty: 'intermediate',
    is_informative: false,
    target_roles: ['representative', 'supervisor', 'manager', 'admin'],
    course_type: 'product_line',
    status: 'published',
    products: [
      'Neuro Vital Kid',
      'Vitacon B',
      'Vitapetit',
      'Zincosol',
      'Crema para Panalitis',
      'Calzinc D',
      'Emulsión',
      'Vitacon C'
    ]
  },
  {
    slug_id: 'sys_line_respiratoria_dolor',
    title: 'Línea Analgésica, Antiinflamatoria & Respiratoria',
    description: 'Manejo clínico del dolor, fiebre y afecciones respiratorias con el portafolio BIOFARCO: Acetaclor, Jengibre Zinc Vit C, Acetaten Forte, Jarabe de Berro, Jarabe Lamedor Compuesto, Rábano Yodado, Pomada Mentolada y MENTOL.',
    category: 'Respiratorio y Dolor',
    points_reward: 350,
    duration_mins: 45,
    difficulty: 'intermediate',
    is_informative: false,
    target_roles: ['representative', 'supervisor', 'manager', 'admin'],
    course_type: 'product_line',
    status: 'published',
    products: [
      'Acetaclor',
      'Jengibre Zinc Vitamina C',
      'Acetaten Forte',
      'Jarabe de Berro',
      'Jarabe Lamedor Compuesto',
      'Rábano Yodado',
      'Pomada Mentolada',
      'MENTOL'
    ]
  },
  {
    slug_id: 'sys_line_gastro_metabolica',
    title: 'Línea Gastrointestinal & Metabólica',
    description: 'Abordaje de trastornos digestivos, equilibrio electrolítico y suplementación mineral: Feryfol, Citrato de Potasio, Cloruro de Magnesio, Limonada Laxante, Leche de Magnesia, Nemozol, Sal de Epsom y Bicarbonato de Sodio.',
    category: 'Gastroenterología y Metabolismo',
    points_reward: 350,
    duration_mins: 45,
    difficulty: 'intermediate',
    is_informative: false,
    target_roles: ['representative', 'supervisor', 'manager', 'admin'],
    course_type: 'product_line',
    status: 'published',
    products: [
      'Feryfol',
      'Citrato de Potasio',
      'Cloruro de Magnesio',
      'Limonada Laxante',
      'Leche de Magnesia',
      'Nemozol',
      'Sal de Epsom  Higuera',
      'Bicarbonato de Sodio'
    ]
  },
  {
    slug_id: 'sys_line_dermatologia_antisepticos',
    title: 'Línea Dermatológica, Cuidado Cutáneo & Antisépticos',
    description: 'Tratamientos tópicos, barrera cutánea y desinfección: Pasta al Agua, Crema Fría, Pomada de Azufre, Loción Calamina, Talco Boricado, Vaselina, NeutroX, Gel Antibacterial, Alcoholes, Denti-OL, Aceites y Glicerina.',
    category: 'Dermatología y Antisépticos',
    points_reward: 400,
    duration_mins: 50,
    difficulty: 'intermediate',
    is_informative: false,
    target_roles: ['representative', 'supervisor', 'manager', 'admin'],
    course_type: 'product_line',
    status: 'published',
    products: [
      'Pasta al Agua',
      'Crema Fría',
      'Pomada de Azufre',
      'Loción Calamina',
      'Talco Boricado',
      'Vaselina',
      ' NeutroX',
      'Gel Antibacterial',
      'Alcohol Antiséptico',
      'Alcohol Absoluto',
      'Alcohol Yodado',
      'Enjuague Bucal Denti-OL',
      'Aceite de Almendras Dulces',
      'Aceite Mineral',
      'Aceite de Ricino',
      'Glicerina USP'
    ]
  },
  {
    slug_id: 'sys_line_magistral_hospitalaria',
    title: 'Línea Fórmulas Magistrales, Fitoterapia & Hospitalaria',
    description: 'Soluciones antisépticas, fitomedicamentos y materias primas grado farmacéutico: Violeta de Genciana, Azul de Metileno, Miel de Borax, Cápsulas Ácido Bórico, Tintura de Valeriana, Árnica, Solución Fisiológica y principios activos puros.',
    category: 'Magistral y Hospitalario',
    points_reward: 400,
    duration_mins: 50,
    difficulty: 'intermediate',
    is_informative: false,
    target_roles: ['representative', 'supervisor', 'manager', 'admin'],
    course_type: 'product_line',
    status: 'published',
    products: [
      'Violeta de Genciana',
      'Azul de Metileno',
      'Miel de Borax',
      'Cápsulas Ácido Bórico',
      'Tintura de Valeriana',
      'Tintura de Árnica',
      'Solución Fisiológica 30mL',
      'Ácido Bórico',
      'Azufre en Polvo',
      'Sulfatiazol',
      'Alumbre en Polvo'
    ]
  }
];

const generatedCourses = [];

for (const line of THERAPEUTIC_LINES) {
  const sections = [];
  const allQuestionsForQuiz = [];

  line.products.forEach((prodName, pIdx) => {
    const sheetRes = findSheet(prodName);
    if (!sheetRes) {
      console.warn(`Sheet "${prodName}" not found in Excel`);
      return;
    }

    const { name: matchedSheetName, sheet } = sheetRes;
    const rows = XLSX.utils.sheet_to_json(sheet);
    const cleanProdName = prodName.trim();
    const prodImg = getImgForProduct(cleanProdName);

    // Group rows by "Tipo de Pregunta"
    const grouped = {};
    rows.forEach(r => {
      const type = (r['Tipo de Pregunta'] || 'General').trim();
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push(r);
    });

    let markdownBody = `## Ficha Técnica y Argumentario Clínico: ${cleanProdName}\n\n`;
    if (prodImg) {
      markdownBody += `![Presentación Oficial ${cleanProdName}](${prodImg})\n\n`;
    }
    markdownBody += `### Resumen de la Formulación y Mecanismo\n`;
    markdownBody += `Esta lección contiene la guía de visita médica oficial para **${cleanProdName}**, recopilando las objeciones y consultas médicas más frecuentes en consultorio y farmacia.\n\n`;

    Object.entries(grouped).forEach(([catName, qList]) => {
      markdownBody += `### 📌 ${catName}\n\n`;
      qList.forEach((item, qIdx) => {
        const q = item['Pregunta del Médico'] || '';
        const logic = item['Lógica del Médico'] || '';
        const ans = item['Posible Respuesta Técnica del Visitador Médico'] || '';

        markdownBody += `#### ${qIdx + 1}. Pregunta del Médico: *"${q}"*\n`;
        if (logic) {
          markdownBody += `> **🧠 Lógica y Preocupación del Facultativo:** ${logic}\n\n`;
        }
        markdownBody += `**💬 Respuesta Técnica Sugerida del Representante:**\n${ans}\n\n---\n\n`;
      });
    });

    sections.push({
      title: `Módulo: ${cleanProdName}`,
      order_index: pIdx,
      lessons: [
        {
          title: `Guía Clínica & Objeciones: ${cleanProdName}`,
          content_type: 'text',
          content_body: markdownBody,
          duration_mins: 6,
          points_reward: 25,
          is_required: true,
          order_index: 0
        }
      ]
    });

    // Select 1-2 key clinical questions per product for the exam
    if (rows.length > 0) {
      const selectedItem = rows.find(r => (r['Tipo de Pregunta'] || '').includes('Eficacia') || (r['Tipo de Pregunta'] || '').includes('Composición')) || rows[0];
      const qText = selectedItem['Pregunta del Médico'];
      const realAns = selectedItem['Posible Respuesta Técnica del Visitador Médico'];
      const prodContext = cleanProdName;

      allQuestionsForQuiz.push({
        question_text: `[${prodContext}] Ante la duda del médico: "${qText}", ¿cuál es la fundamentación clínica correcta?`,
        question_type: 'multiple_choice',
        correct_answer: realAns.slice(0, 140) + '...',
        realAnsFull: realAns,
        itemContext: selectedItem
      });
    }
  });

  // Build Quiz
  const quizQuestions = allQuestionsForQuiz.slice(0, 8).map((q, qIdx) => {
    // Generate realistic distractors
    const optA = q.realAnsFull.length > 150 ? q.realAnsFull.slice(0, 150) + '...' : q.realAnsFull;
    const optB = 'Indicar que el producto es un suplemento general sin contraindicaciones y puede prescribirse a libre demanda sin pauta.';
    const optC = 'Recomendar aumentar la dosis al doble si no se observa efecto inmediato en las primeras 6 horas.';
    const optD = 'Mencionar que el principio activo no tiene metabolismo hepático ni renal, por lo que carece de precauciones.';

    return {
      question_text: q.question_text,
      question_type: 'multiple_choice',
      options: [
        { label: `A) ${optA}`, value: 'A' },
        { label: `B) ${optB}`, value: 'B' },
        { label: `C) ${optC}`, value: 'C' },
        { label: `D) ${optD}`, value: 'D' }
      ],
      correct_answer: 'A',
      points: 15,
      order_index: qIdx
    };
  });

  generatedCourses.push({
    slug_id: line.slug_id,
    title: line.title,
    description: line.description,
    category: line.category,
    points_reward: line.points_reward,
    duration_mins: line.duration_mins,
    difficulty: line.difficulty,
    is_informative: line.is_informative,
    target_roles: line.target_roles,
    course_type: line.course_type,
    status: line.status,
    sections,
    quiz: {
      title: `Examen de Certificación: ${line.title.split(':')[0]}`,
      passing_score: 80,
      max_attempts: 3,
      time_limit_mins: 15,
      questions: quizQuestions
    }
  });
}

console.log('Generated Master Courses count:', generatedCourses.length);
fs.writeFileSync(
  path.resolve('src/utils/productLinesData.json'),
  JSON.stringify(generatedCourses, null, 2),
  'utf-8'
);
console.log('Saved to src/utils/productLinesData.json');
