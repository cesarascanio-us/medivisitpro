/**
 * Map BIOFARCO products to their real packaging photos in /products/
 */

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  // Pediátricos & Nutricionales
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
  'emulsión multivitamínica': '/products/Emulsion.png',
  'crema para pañalitis': '/products/PastaAgua.png',
  'crema para panalitis': '/products/PastaAgua.png',
  'kurd & care': '/products/Kurd&Care.png',
  'kurd and care': '/products/Kurd&Care.png',
  'probiolitos': '/products/Probiolitos.png',
  'probiocon zinc': '/products/ProbioconZinc.png',
  'hydroral': '/products/Hydroral.png',
  'hydroral pro': '/products/HydroralPro.png',

  // Analgésicos, Antiinflamatorios & Respiratorios
  'acetaclor': '/products/Acetaclor.png',
  'acetafen': '/products/Acetafen.png',
  'acetafen forte': '/products/Acetafen.png',
  'acetaten forte': '/products/Acetafen.png',
  'acetaten': '/products/Acetafen.png',
  'jarabe de berro': '/products/JarabeBerro.png',
  'jarabe berro': '/products/JarabeBerro.png',
  'jengibre': '/products/Jengibre.png',
  'jengibre zinc vit c': '/products/Jengibre.png',
  'mentol crema': '/products/MentolCrema.png',
  'pomada mentolada': '/products/MentolCrema.png',
  'mentol rollon': '/products/MentolRollon.png',
  'mentol roll-on': '/products/MentolRollon.png',
  'mentol spray': '/products/MentolSpray.png',
  'mentol': '/products/MentolSpray.png',

  // Gastrointestinales & Metabólicos
  'citrato de potasio': '/products/Citrato.png',
  'citrato': '/products/Citrato.png',
  'cloruro de magnesio': '/products/Cloruro.png',
  'cloruro': '/products/Cloruro.png',
  'feryfol': '/products/Feryfol.png',
  'leche de magnesia': '/products/LecheMagnesia.png',
  'magnesia': '/products/LecheMagnesia.png',
  'limonada laxante': '/products/LimonadaLaxante.png',
  'nemozol': '/products/Nemazol.png',
  'nemazol': '/products/Nemazol.png',
  'sal de epsom': '/products/SalEpsom.png',
  'sal de higuera': '/products/SalEpsom.png',
  'urisoft': '/products/Urisoft.png',

  // Dermatológicos & Antisépticos
  'pasta al agua': '/products/PastaAgua.png',
  'pasta de agua': '/products/PastaAgua.png',
  'calamina': '/products/Calamina.png',
  'loción calamina': '/products/Calamina.png',
  'locion calamina': '/products/Calamina.png',
  'talco boricado': '/products/TalcoBoricado.png',
  'neutrox': '/products/NeutroX.png',
  'neutro x': '/products/NeutroX.png',
  'vaselina': '/products/VaselinaTarro.png',
  'vaselina blanca': '/products/VaselinaTarro.png',
  'vaselina pura': '/products/VaselinaTarro.png',
  'glicerina': '/products/Glicerina.png',
  'glicerina usp': '/products/Glicerina.png',
  'aceite de almendras': '/products/AceiteAlmendras.png',
  'aceite almendras': '/products/AceiteAlmendras.png',
  'aceite de coco': '/products/AceiteCoco.png',
  'aceite coco': '/products/AceiteCoco.png',
  'aceite mineral': '/products/AceiteMineral.png',
  'aceite de ricino': '/products/AceiteRicino.png',
  'aceite ricino': '/products/AceiteRicino.png',
  'colodion': '/products/Colodion.png',
  'colodión': '/products/Colodion.png',

  // Hospitalarios, Antisépticos & Magistrales
  'alcohol absoluto': '/products/AlcoholAbsoluto.png',
  'alcohol antiséptico': '/products/AlcoholAnticeptico.png',
  'alcohol antiseptico': '/products/AlcoholAnticeptico.png',
  'alcohol yodado': '/products/AlcoholYodado.png',
  'azufre': '/products/Azufre.png',
  'azufre en polvo': '/products/Azufre.png',
  'azul de metileno': '/products/AzulMetileno.png',
  'azul metileno': '/products/AzulMetileno.png',
  'violeta de genciana': '/products/VioletaGenciana.png',
  'violeta genciana': '/products/VioletaGenciana.png',
  'ácido bórico': '/products/AcidoBorico.png',
  'acido borico': '/products/AcidoBorico.png',
  'miel de borax': '/products/MielBorax.png',
  'miel borax': '/products/MielBorax.png'
};

/**
 * Returns the best matching product image URL for a given product name or fallback URL
 */
export function getProductImageUrl(productName?: string | null, fallbackUrl?: string | null): string | undefined {
  if (fallbackUrl && fallbackUrl.trim().length > 0) {
    return fallbackUrl;
  }

  if (!productName) return undefined;

  const normalized = productName.toLowerCase().trim();

  // 1. Direct match
  if (PRODUCT_IMAGE_MAP[normalized]) {
    return PRODUCT_IMAGE_MAP[normalized];
  }

  // 2. Partial/substring match
  for (const [key, url] of Object.entries(PRODUCT_IMAGE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  return undefined;
}
