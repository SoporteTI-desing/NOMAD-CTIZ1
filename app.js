

// === Integración Login + Sheets + Folios ===
const GAS_URL = "https://script.google.com/macros/s/AKfycbzqP78PjTMVeHsLnDVylPp-EWIlYsPTN1sA3YamJM0NkkplZLMzcB4keWivN6qH_BtU/exec"; // <-- pega aquí tu URL de Apps Script

function zeroPad(n, size=4){ n = parseInt(n||0,10); return String(n).padStart(size,'0'); }

async function getNextFolio(){
  // Intenta obtener desde Apps Script (opcional)
  if (GAS_URL && GAS_URL.startsWith("https://")) {
    try{
      const r = await fetch(GAS_URL + "?action=nextFolio");
      if(r.ok){
        const j = await r.json();
        if(j && j.folio){ 
          localStorage.setItem("folioLast", j.folio);
          return j.folio;
        }
      }
    }catch(e){ console.warn("No se pudo obtener folio desde GAS:", e); }
  }
  // Fallback local
  let last = parseInt(localStorage.getItem("folioLast")||"0",10) + 1;
  const f = zeroPad(last);
  localStorage.setItem("folioLast", String(last));
  return f;
}


async function sendToSheet({folio, paciente, fecha, usuario}){
  if(!GAS_URL || GAS_URL.includes("https://script.google.com/mac...MzcB4keWivN6qH_BtU/exec")) return; // evitar fallos si no lo configuran
  try {
    await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ folio, paciente, fecha, usuario })
    });
  } catch(e){ console.warn("Error enviando a Google Sheets:", e); }
}

// === Payload para guardar cotización NOMAD en Firestore ===
function getCotizacionPayloadNomad(folio){
  try{
    const totalEl = document.getElementById('total');
    const total = totalEl
      ? Number((totalEl.textContent || '').replace(/[^0-9.,-]/g,'').replace(/,/g,'')) || 0
      : 0;

    const pruebas = Array.from(
      document.querySelectorAll('#tablaPruebas tbody tr')
    ).map(tr => {
      const tds = tr.querySelectorAll('td');
      const parse = (txt) =>
        Number((txt || '').replace(/[^0-9.,-]/g,'').replace(/,/g,'')) || 0;

      return {
        prueba:   (tds[0]?.textContent || '').trim(),
        cantidad: parse(tds[1]?.textContent || ''),
        precioUnit: parse(tds[2]?.textContent || ''),
        subtotal: parse(tds[3]?.textContent || '')
      };
    });

    return {
      folio: folio || '',
      fechaEmision: document.getElementById('fechaEmision')?.value || '',
      fechaValidez: document.getElementById('fechaValidez')?.value || '',
      realizadoPor: document.getElementById('realizadoPor')?.value || '',
      paciente: document.getElementById('paciente')?.value || '',
      medico: document.getElementById('medico')?.value || '',
      aseguradora: document.getElementById('aseguradora')?.value || '',
      kam: document.getElementById('kam')?.value || '',
      diagnostico: document.getElementById('diagnostico')?.value || '',
      fechaProgramacion: document.getElementById('fechaProgramacion')?.value || '',
      total,
      pruebas
    };
  }catch(e){
    console.warn('No se pudo construir el payload de cotización NOMAD', e);
    return { folio: folio || '', error: String(e) };
  }
}
// === Datos embebidos (sin fetch) ===
const DATASETS = {"gestion_nomad":[{"nombre":"FoundationOne CDx","precio":95000.0},{"nombre":"FoundationOne Liquid CDx","precio":95000.0},{"nombre":"FoundationOne Heme","precio":116500.0},{"nombre":"Foundation One CDX  Por ti (50% )","precio":47500.0},{"nombre":"Foundation One Liquid Por ti (50% )","precio":47500.0},{"nombre":"Avenio Roche Tissue(campaña)","precio":30000.0},{"nombre":"Avenio Roche Tissue","precio":48000.0},{"nombre":"Examen OncoIDX Complete ctDNA","precio":48000.0},{"nombre":"OncotypeDX","precio":112997.41},{"nombre":"Guardant360 CDx","precio":80270.0},{"nombre":"Guardant360 CDx Expanded","precio":92000.0},{"nombre":"Guardant Health Reveal","precio":83950.0},{"nombre":"Tempus xF","precio":85344.83},{"nombre":"Tempus xF+","precio":85344.83},{"nombre":"Tempus xT","precio":85344.83},{"nombre":"Tempus xT + xR","precio":85344.83},{"nombre":"INVITAE Panel multicancer ","precio":15775.86},{"nombre":"INVITAE Panel multicancer (familiar adicional)","precio":7887.93},{"nombre":"INVITAE Common herditary Cancer","precio":15775.86},{"nombre":"INVITAE Hereditary Breast Cancer STAT Panel","precio":15775.86},{"nombre":"OncoIDX Tissue","precio":50000.0},{"nombre":"Cordex1021 Liquid + PGx","precio":53879.31034482759},{"nombre":"Cordex500 xT","precio":50000.0},{"nombre":"Cordex40 Colorectal","precio":25862.068965517243},{"nombre":"Cordex40 Endometrio","precio":25862.068965517243},{"nombre":"Cordex40 Mama","precio":25862.068965517243},{"nombre":"Cordex40 Pulmón","precio":25862.068965517243},{"nombre":"Cordex40 Hígado","precio":25862.068965517243},{"nombre":"Cordex40 Tiroides","precio":25862.068965517243},{"nombre":"Cordex40 Gástrico","precio":25862.068965517243},{"nombre":"Cordex40 Vejiga","precio":25862.068965517243},{"nombre":"Cordex40 Gastrointestinal","precio":25862.068965517243}],"gestion_comercial":[{"nombre":"FoundationOne CDx","precio":111744.0},{"nombre":"FoundationOne Liquid CDx","precio":111744.0},{"nombre":"FoundationOne Heme","precio":111744.0},{"nombre":"Foundation One CDX  Por ti (50% )","precio":47500.0},{"nombre":"Foundation One Liquid Por ti (50% )","precio":47500.0},{"nombre":"Avenio Roche Tissue(campaña)","precio":30000.0},{"nombre":"Avenio Roche Tissue","precio":48000.0},{"nombre":"Examen OncoIDX Complete ctDNA","precio":48000.0},{"nombre":"Guardant360 CDx","precio":101325.0},{"nombre":"Guardant360 CDx Expanded","precio":101325.0},{"nombre":"Guardant Health Reveal","precio":101325.0},{"nombre":"Tempus xF","precio":100000.0},{"nombre":"Tempus xF+","precio":100000.0},{"nombre":"Tempus xT","precio":100000.0},{"nombre":"Tempus xT + xR","precio":100000.0},{"nombre":"INVITAE Panel multicancer ","precio":15775.86},{"nombre":"INVITAE Panel multicancer (familiar adicional)","precio":7887.93},{"nombre":"OncotypeDX","precio":112997.41},{"nombre":"INVITAE Common herditary Cancer","precio":15775.86},{"nombre":"INVITAE Hereditary Breast Cancer STAT Panel","precio":15775.86},{"nombre":"OncoIDX Tissue","precio":50000.0},{"nombre":"Cordex1021 Liquid + PGx","precio":53879.31034482759},{"nombre":"Cordex40 Colorectal","precio":25862.068965517243},{"nombre":"Cordex40 Endometrio","precio":25862.068965517243},{"nombre":"Cordex40 Mama","precio":25862.068965517243},{"nombre":"Cordex40 Pulmón","precio":25862.068965517243},{"nombre":"Cordex40 Hígado","precio":25862.068965517243},{"nombre":"Cordex40 Tiroides","precio":25862.068965517243},{"nombre":"Cordex40 Gástrico","precio":25862.068965517243},{"nombre":"Cordex40 Vejiga","precio":25862.068965517243},{"nombre":"Cordex40 Gastrointestinal","precio":25862.068965517243}],"gnp":[{"nombre":"FoundationOne CDx","precio":83000.0},{"nombre":"FoundationOne Liquid CDx","precio":83000.0},{"nombre":"FoundationOne Heme","precio":116500.0},{"nombre":"Foundation One CDX  Por ti (50% )","precio":47500.0},{"nombre":"Foundation One Liquid Por ti (50% )","precio":47500.0},{"nombre":"Avenio Roche Tissue(campaña)","precio":30000.0},{"nombre":"Avenio Roche Tissue","precio":48000.0},{"nombre":"Examen OncoIDX Complete ctDNA","precio":48000.0},{"nombre":"Guardant360 CDx","precio":80270.0},{"nombre":"Guardant360 CDx Expanded","precio":92000.0},{"nombre":"Guardant Health Reveal","precio":83950.0},{"nombre":"Tempus xF","precio":85344.83},{"nombre":"Tempus xF+","precio":85344.83},{"nombre":"Tempus xT","precio":85344.83},{"nombre":"Tempus xT + xR","precio":85344.83},{"nombre":"INVITAE Panel multicancer ","precio":15775.86},{"nombre":"INVITAE Panel multicancer (familiar adicional)","precio":7887.93},{"nombre":"INVITAE Common herditary Cancer","precio":15775.86},{"nombre":"INVITAE Hereditary Breast Cancer STAT Panel","precio":15775.86},{"nombre":"OncoIDX Tissue","precio":50000.0},{"nombre":"Cordex1021 Liquid + PGx","precio":53879.31034482759},{"nombre":"Cordex40 Colorectal","precio":25862.068965517243},{"nombre":"Cordex40 Endometrio","precio":25862.068965517243},{"nombre":"Cordex40 Mama","precio":25862.068965517243},{"nombre":"Cordex40 Pulmón","precio":25862.068965517243},{"nombre":"Cordex40 Hígado","precio":25862.068965517243},{"nombre":"Cordex40 Tiroides","precio":25862.068965517243},{"nombre":"Cordex40 Gástrico","precio":25862.068965517243},{"nombre":"Cordex40 Vejiga","precio":25862.068965517243},{"nombre":"Cordex40 Gastrointestinal","precio":25862.068965517243}],"dra_genoveva":[{"nombre":"FoundationOne CDx","precio":78300.0},{"nombre":"FoundationOne Liquid CDx","precio":78300.0},{"nombre":"FoundationOne Heme","precio":116500.0},{"nombre":"Foundation One CDX  Por ti (50% )","precio":47500.0},{"nombre":"Foundation One Liquid Por ti (50% )","precio":47500.0},{"nombre":"Avenio Roche Tissue(campaña)","precio":30000.0},{"nombre":"Avenio Roche Tissue","precio":48000.0},{"nombre":"Examen OncoIDX Complete ctDNA","precio":48000.0},{"nombre":"Guardant360 CDx","precio":80270.0},{"nombre":"Guardant360 CDx Expanded","precio":92000.0},{"nombre":"Guardant Health Reveal","precio":83950.0},{"nombre":"OncotypeDX","precio":112997.41},{"nombre":"Tempus xF","precio":85344.83},{"nombre":"Tempus xF+","precio":85344.83},{"nombre":"Tempus xT","precio":85344.83},{"nombre":"Tempus xT + xR","precio":85344.83},{"nombre":"INVITAE Panel multicancer ","precio":15775.86},{"nombre":"INVITAE Panel multicancer (familiar adicional)","precio":7887.93},{"nombre":"INVITAE Common herditary Cancer","precio":15775.86},{"nombre":"INVITAE Hereditary Breast Cancer STAT Panel","precio":15775.86},{"nombre":"OncoIDX Tissue","precio":50000.0},{"nombre":"Cordex1021 Liquid + PGx","precio":53879.31034482759},{"nombre":"Cordex40 Colorectal","precio":25862.068965517243},{"nombre":"Cordex40 Endometrio","precio":25862.068965517243},{"nombre":"Cordex40 Mama","precio":25862.068965517243},{"nombre":"Cordex40 Pulmón","precio":25862.068965517243},{"nombre":"Cordex40 Hígado","precio":25862.068965517243},{"nombre":"Cordex40 Tiroides","precio":25862.068965517243},{"nombre":"Cordex40 Gástrico","precio":25862.068965517243},{"nombre":"Cordex40 Vejiga","precio":25862.068965517243},{"nombre":"Cordex40 Gastrointestinal","precio":25862.068965517243}]};

// === Biomarcadores (desde Excel) ===
const BIOMARCADORES = {"gestion_nomad": [{"nombre": "Biomarcador PDL 1","precio": 2800.0},{"nombre": "Biomarcador HRD","precio": 5180.0},{"nombre": "Biomarcador MMR","precio": 5600.0},{"nombre": "Biomarcador PDY","precio": 5180.0},{"nombre": "Biomarcador HER 2","precio": 3340.0},{"nombre": "Biomarcador HER2 + FISH","precio": 6440.0},{"nombre": "Algorithmic Tumor Origin","precio": 5600.0},{"nombre": "MGMT Methylation","precio": 5600.0},{"nombre": "UGT1A1","precio": 5180.0},{"nombre": "POLE / POLD1","precio": 2800.0},{"nombre": "PDL1 SP263 y 22C3","precio": 2800.0},{"nombre": "CLDN18","precio": 5600.0},{"nombre": "cMET","precio": 2800.0},{"nombre": "Biomarcador FOLR1","precio": 3340.0},{"nombre": "CLAUDIN18","precio": 5937.43},{"nombre": "FLOR1","precio": 5937.43},{"nombre": "MET","precio": 5937.43},{"nombre": "MMR","precio": 5937.43},{"nombre": "PD-L1","precio": 5937.43}],"gestion_comercial": [{"nombre": "Biomarcador PDL 1","precio": 2800.0},{"nombre": "Biomarcador HRD","precio": 5180.0},{"nombre": "Biomarcador MMR","precio": 5600.0},{"nombre": "Biomarcador PDY","precio": 5180.0},{"nombre": "Biomarcador HER 2","precio": 3340.0},{"nombre": "Biomarcador HER2 + FISH","precio": 6440.0},{"nombre": "Algorithmic Tumor Origin","precio": 5600.0},{"nombre": "MGMT Methylation","precio": 5600.0},{"nombre": "UGT1A1","precio": 5180.0},{"nombre": "POLE / POLD1","precio": 2800.0},{"nombre": "PDL1 SP263 y 22C3","precio": 2800.0},{"nombre": "CLDN18","precio": 5600.0},{"nombre": "cMET","precio": 2800.0},{"nombre": "Biomarcador FOLR1","precio": 3340.0},{"nombre": "CLAUDIN18","precio": 5937.43},{"nombre": "FLOR1","precio": 5937.43},{"nombre": "MET","precio": 5937.43},{"nombre": "MMR","precio": 5937.43},{"nombre": "PD-L1","precio": 5937.43}],"gnp": [{"nombre": "Biomarcador PDL 1","precio": 2800.0},{"nombre": "Biomarcador HRD","precio": 5180.0},{"nombre": "Biomarcador MMR","precio": 5600.0},{"nombre": "Biomarcador PDY","precio": 5180.0},{"nombre": "Biomarcador HER 2","precio": 3340.0},{"nombre": "Biomarcador HER2 + FISH","precio": 6440.0},{"nombre": "Algorithmic Tumor Origin","precio": 5600.0},{"nombre": "MGMT Methylation","precio": 5600.0},{"nombre": "UGT1A1","precio": 5180.0},{"nombre": "POLE / POLD1","precio": 2800.0},{"nombre": "PDL1 SP263 y 22C3","precio": 2800.0},{"nombre": "CLDN18","precio": 5600.0},{"nombre": "cMET","precio": 2800.0},{"nombre": "Biomarcador FOLR1","precio": 3340.0},{"nombre": "CLAUDIN18","precio": 5937.43},{"nombre": "FLOR1","precio": 5937.43},{"nombre": "MET","precio": 5937.43},{"nombre": "MMR","precio": 5937.43},{"nombre": "PD-L1","precio": 5937.43}],"dra_genoveva": [{"nombre": "Biomarcador PDL 1","precio": 2800.0},{"nombre": "Biomarcador HRD","precio": 5180.0},{"nombre": "Biomarcador MMR","precio": 5600.0},{"nombre": "Biomarcador PDY","precio": 5180.0},{"nombre": "Biomarcador HER 2","precio": 3340.0},{"nombre": "Biomarcador HER2 + FISH","precio": 6440.0},{"nombre": "Algorithmic Tumor Origin","precio": 5600.0},{"nombre": "MGMT Methylation","precio": 5600.0},{"nombre": "UGT1A1","precio": 5180.0},{"nombre": "POLE / POLD1","precio": 2800.0},{"nombre": "PDL1 SP263 y 22C3","precio": 2800.0},{"nombre": "CLDN18","precio": 5600.0},{"nombre": "cMET","precio": 2800.0},{"nombre": "Biomarcador FOLR1","precio": 3340.0},{"nombre": "CLAUDIN18","precio": 5937.43},{"nombre": "FLOR1","precio": 5937.43},{"nombre": "MET","precio": 5937.43},{"nombre": "MMR","precio": 5937.43},{"nombre": "PD-L1","precio": 5937.43}]};

const MEDICOS = [{"Doctor": "AARON GONZALEZ ENCISO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ABEL BERNECHEA MIRANDA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ABIGAIL SAMOAYA MATEOS SORIA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ADRIAN CRAVIOTO VILLANUEVA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ADRIAN GOMEZ GOMEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ALAN BURGUETE TORRES","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ALAN LEDIF REYES MONDRAGON","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ALBERTO ALVARADO MIRANDA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ALBERTO GONZALEZ AGUILAR","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ALBERTO MITSUO LEON TAKAHASHI","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ALBERTO MONROY CHARGOY","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ALBERTO OLAYA VARGAS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ALBERTO VIELMA VALDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ALBERTO VILLALOBOS PRIETO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ALEJANDRA ARMENGOL ALONSO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ALEJANDRA JIMENA GARCÍA VELAZQUEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALEJANDRO CASTILLO GALEAZZI","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ALEJANDRO DE LEON CRUZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ALEJANDRO LOPEZ CUETO ESPINOZA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ALEJANDRO MARTINEZ RUEDA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALEJANDRO NOGUEZ RAMOS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ALETHIA ALVAREZ CANO","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ALFONSO CERVERA UBIERNA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ALFONSO PEREZ BAÑUELOS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ALFONSO TORRES LOBATON","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALFONSO TORRES ROJO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ALFREDO AVILA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ALICIA GUTIERREZ MATA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ALLAN LEGASPI SAUTER","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ALMA AZUCENA SEGURA CHAMA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALMA GEORGINA PALACIOS MARTINEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALMA LILIA ORTIZ MALDONADO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ALMA MAGDALENA ASTORGA RAMOS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALMA MARIA MEDRANO HERNANDEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ALMA ROSA LOPEZ MARISCAL","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ALVARO AGUAYO GONZALEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ALVARO BARBOSA-QUINTANA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ALVARO LEZID PADILLA RODRIGUEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "AMANCIO GATICA PEREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ANA CRISTINA ARTEAGA GOMEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ANA ELENA MARTIN AGUILAR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ANA GRACIELA PUEBLA MORA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ANA MARIA ZEMPOALTECA LOPEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ANA OLIVIA CORTÉS FLORES","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ANA PAULINA MELENDEZ FERNANDEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ANAIT ABAD SOLARES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ANDREA CASTRO SÁNCHEZ","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "ANGEL AZAEL LOPEZ GALINDO","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ANGELICA CONCEPCION CRUZ CADENA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ANTONIO ALFEIRAN RUIZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ANTONIO GOMEZ PEDRAZA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ANTONIO GUILLERMO ZALDIVAR NEAL","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "ANTONIO MAFFUZ AZIZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ANTONIO ROLON PADILLA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ANTONIO VELAZQUEZ GONZALEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ARACELI RIVERA SANTIAGO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ARIADNA ESTELA GONZALEZ DEL ANGEL","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ARMANDO BERNANDO MARTINEZ AVALOS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ARMANDO RAMIREZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ARMEN STANKOV DRAGAN","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ARTURO PABEL MIRANDA AGUIRRE","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ATZIRI AIDEE MADERO CASTRO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "AURORA MEDINA SANSON","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "AZCARY VAZQUEZ TINAJERO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "BENIGNO EMMANUEL RODRIGUEZ SOTO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "BENITO SANCHEZ LLAMAS","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "BENITO SÁNCHEZ LLAMAS","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "BETSABE HERNANDEZ HERNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "BRENDA LETICIA GONZALEZ GARCÍA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "BRIZIO MORENO JAIME","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CARLO EGYSTO CICERO ONETO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "CARLOS ALBERTO LARA GUTIÉRREZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "CARLOS ALBERTO RAMIREZ ALVARADO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CARLOS ALBERTO RONQUILLO CARREON","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CARLOS ALBERTO RONQUILLO CARREÓN","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CARLOS ALBERTO SERVIN HERNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "CARLOS ARANDA FLORES","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "CARLOS ARTURO GONZALEZ NUÑEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "CARLOS AUGUSTO GUTIERREZ FLORES","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "CARLOS DANIEL LEVER ROSAS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "CARLOS DANIEL ROBLES VIDAL","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "CARLOS EDUARDO QUINTERO RODRIGUEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "CARLOS EDUARDO SALAZAR MEJIA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "CARLOS MANUEL ORTIZ MENDOZA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "CARLOS RAMIREZ ALVARADO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CARLOS ROBERTO LUGO ESCALANTE","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "CARLOS ZULOAGA FERNANDEZ DEL VALLE","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CARMEN AGUILAR JIMENEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "CARMEN GUADALUPE BERMUDEZ BARRIENTOS","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "CELEBRITY CITLALLI LÓPEZ ARCIGA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "CESAR DANIEL HERNANDEZ MENDEZ","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "CESAR GONZALEZ DE LEON","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "CESAR SALDIVAR MORENO","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "CHRISTIAN PATRICIO CAMACHO LIMAS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "CINDY AIDEE NAJERA MUÑOZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "CLAUDIA LORENA URZUA FLORES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "CLAUDIO RENE MONTESDEOCA ORELLANA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "CONNIE ZURATZI DENEKEN HERNANDEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "CONSUELO IRENE GUTIERREZ COLIN","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "CRISTINA ALVARADO SILVA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "CRISTOBAL DIAZ GOMEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "CYNTHIA VILLARREAL","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "DAGOBERTO MOLINA POLO LOPEZ DE CARDENAS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "DAN GREEN REENER","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "DANIEL ABELARDO LOPEZ VALLEJO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SERGIO ALEJANDRO ARREOLA VALDEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DANIEL ALEJANDRO GARCIA PADILLA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DANIEL ALEJANDRO GARCÍA PADILLA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DANIEL CAPDEVILLE GARCIA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DANIEL CAPDEVILLE GARCÍA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DANIEL MOTOLA KUBA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "DANIEL PEREZ CERVANTES","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DANIEL VALENCIA MERCADO","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "DANIELA HERNANDEZ LARA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "DANIELA SHVEID GERSON","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "DANIELA VAZQUEZ JUAREZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "DANIELLA GOMEZ PUE","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "DANTE CARBAJAL OCAMPO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "DAVID ACOSTA GUTIERREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "DAVID CAZAREZ SANCHEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DAVID CÁZAREZ SÁNCHEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DAVID CUEVAS QUEZADA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DAVID DAVILA DUPONT","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "DAVID EDUARDO MUÑOZ GONZALEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "DAVID FRANCISCO CANTU DE LEON","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "DAVID FUENTES MEDINA","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "DAVID JOSÉ HEREDIA VÁZQUEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "DAVID ORTA CORTES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "DAVID PONCE HERRERA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DAVID SUAREZ GARCIA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DEBORAH MARIA MARTINEZ BAÑOS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "DENISE ACUÑA GONZALEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "DENISSE EUGENIA LEE CERVANTES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "DENYS ELIZABETH DELGADO AMADOR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "DIANA ALEJANDRA VILLEGAS OSORNO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "DIANA FABIOLA FLORES","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "DIANA PATRICIA JIMENEZ CARRANZA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "DIEGO A. DÍAZ GARCÍA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DIEGO ALFONSO BALLESTEROS PINO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "DIEGO ARMANDO DIAZ GARCIA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "DIEGO JORGE","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "DIEGO OSORIO PEREZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "DINO ALBERTO MURILLO CRUZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "DIONE AGUILAR Y MENDEZ","KAM": "LOGISTICA","TELEFONO KAM": "5579949420"},{"Doctor": "DOLORES GALLARDO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "DORA GILDA MAYEN MOLINA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "EDER A ARANGO BRAVO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "EDER ARAIZA ALVARADO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "EDGAR NERI PAEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "EDGAR RODRIGUEZ ANTEZANA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "EDGAR VARELA SANTOYO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "EDIO LLERENA HERNANDEZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "EDITH GARCIA LUNA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "EDNA ROJAS CURIEL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "EDUARDO ALBERTO GUZMAN HUERTA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "EDUARDO ANTONIO MAAFS MOLINA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "EDUARDO BARRAGAN CURIEL","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "EDUARDO EDMUNDO REYNOSO GOMEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "EDUARDO EMIR CERVERA CEBALLOS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "EDUARDO JORGE BAÑOS RODRIGUEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "EDUARDO TELLEZ BERNAL","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "EDWARD MORGAN OCHOA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "EFRAIN CAMARIN SANCHEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "EFRAIN SALAS GONZALEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ELEAZAR OMAR MACEDO LOPEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ELIA IXEL APODACA CHAVEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ELIA NALLELY BARRIENTOS LUNA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ELIAS RESCALA BACA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ELISEO EMMANUEL JUAREZ ZUÑIGA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ELISEO NEFTALI DE LA CRUZ ESCOBAR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ELIZABETH ESCOBAR ARRIAGA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ELIZABETH SANCHEZ VALLE","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ELVIRA GOMEZ GOMEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "EMILIO CONDE","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "EMILIO GAMEZ UGALDE","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "EMILIO MURILLO RAMIREZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "EMMANUEL DE LA MORA JIMENEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ENRIQUE AVILA MONTEVERDE","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ENRIQUE CABALLÉ PÉREZ","KAM": "Logística","TELEFONO KAM": "5579949420"},{"Doctor": "ENRIQUE GOMEZ MORALES","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ENRIQUE JOSE ZAMUDIO LOZOYA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ERIC ORTIZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ERICK FLORES OROZCO","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "ERICK SALADO RAMIREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ERIKA BETZABE RUIZ GARCIA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ERIKA SUSANA BARBOSA AVALOS","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ERNESTO JOSE ZEPEDA CASTILLA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ERNESTO MORENO SALAS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ERNESTO R. SANCHEZ FORGACH","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ESMERALDA ROMERO BAÑUELOS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ETZALLI PAMELA LINARES CHAVEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "EUCARIO LEON RODRIGUEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "EVA RUVALCABA LIMON","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FEDERICO MALDONADO MAGOS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "FELIPE DE JESUS ANCHONDO ORTEGA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "FELIPE VILLEGAS CARLOS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "FERNANDO ALDACO SARVIDE","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "FERNANDO CANDANEDO GONZALEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FERNANDO CERECEDO DIAZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "FERNANDO CORDERA GONZALEZ DE COSIO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "FERNANDO ENRIQUE MAINEROL RATCHEOLUS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FERNANDO JAVIER VILLALOBOS PEÑA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "FERNANDO PEREZ ZINCER","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "FERNANDO SALDIVAR GALINDO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "FERNANDO ULISES LARA GONZALEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "FERNANDO ULISES LARA MEDINA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "FIDEL DAVID HUITZIL MELENDEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "FLAVIA MORALES VASQUEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "FLOR DE THE BUSTAMANTE VALLES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "FLOR MARIA ARMILLAS CANSECO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FRANCISCO GALLEGOS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "FRANCISCO JAVIER ALVARADO VILLAREAL","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "FRANCISCO JAVIER GOMEZ-PEDROSO REA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FRANCISCO JAVIER OCHOA CARRILLO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FRANCISCO LOPEZ SACHINAS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FRANCO KRAKAUR GARCIA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "FROYLAN LOPEZ LOPEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "FROYLAN LÓPEZ LÓPEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GABRIEL GALVAN SALAZAR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GABRIEL ORLANDO GARCIA ACEVEDO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "GABRIEL PACHECO JUAREZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GABRIEL SANTIAGO CONCHA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "GABRIEL TELLEZ TREVILLA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "GABRIELA ALAMILLA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "GABRIELA ALVARADO LUNA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "GABRIELA AZUCENA ARENAS PEREZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "GABRIELA NUÑEZ GUARDADO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GABRIELA OLIVIA REGALADO PORRAS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "GABRIELA SOFIA GOMEZ MACIAS","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "GENOVEVA OCHOA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GEORGINA GARNICA JALIFFE","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GEOVANI AMADOR GARCIA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "GERARDO AMARANTE DE LEON","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "GERARDO CARDENAS","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "GERARDO CASTORENA ROJI","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "GERARDO DAVID AMARANTE DE LEON","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "GERARDO GABRIEL MINAURO MUÑOZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GERARDO MIRANDA DEVORA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "GERMAN CALDERILLO CRUZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "GERMAN CASTELAZO RAMIREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GERMAN CASTELAZO RICO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GILBERTO MORGAN VILLELA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "GILDA SOFIA GARZA MAYEN","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "GISELA NIEVES HERNANDEZ RUIZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GLORIA MARTINEZ MARTINEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GREDEL PORTELA RUBIO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GREGORIO QUINTERO BEULO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "GUADALUPE EVARISTO CEDILLO SALAZAR","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "GUILLERMO FABIAN SILVA ESCOBAR","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "GUILLERMO GOCHER DAMIAN","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "GUILLERMO MANUEL OLIVARES BELTRAN","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "GUILLERMO MARTOS RAMIREZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "GUILLERMO MORENO FLORES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GUSTAVO FLORENCIO CORTES MARTINEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "GUSTAVO JONY RAMOS BLAS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "GUSTAVO SEBASTIAN ESCOBAR ALFARO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "HAYDEÉ CRISTINA VERDUZCO AGUIRRE","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "HEBER TOMAS REYES GARCIA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "HECTOR ARIAS CEBALLOS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "HÉCTOR BENITEZ ARROYO","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "HECTOR DANIEL MALDONADO JIMENEZ","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "HECTOR DE LA MORA MOLINA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "HECTOR MARTINEZ SAID","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "HECTOR RODRIGUEZ NAVARRO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "HERMINIA DEL SOCORRO ARVELO SAAVEDRA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "HIRAM JOSUE GRIMALDO ROQUE","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "HORACIO DECANINI ARCAUTE","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "HORACIO NOE LOPEZ BASAVE","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "HORACIO SUAREZ DEL PUERTO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "IDELFONSO ROBERTO DE LA PEÑA LOPEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "IGNACIO JAIME PEREZ MARTINEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "IGNACIO MARISCAL RAMIREZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "IGNACIO MIGUEL FUENTES MENDEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ILEANA MCKINNEY NOVELO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "IRINEO DOMINGUEZ GABRIEL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "IRMA SOLDEVILLA GALLARDO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "IRVING JAVIER MEJIA HERNANDEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ISAAC LUNA BENITEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ITZEL VELA SARMIENTO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ITZIA VERDUZCO FLORES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "IVAN EUDALDO DIAZ MENESES","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "IVAN ORTIZ CALDERON","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "IVAN ROMARICO GONZALEZ ESPINOZA","KAM": "PUEBLA","TELEFONO KAM": "5543401015"},{"Doctor": "IVAN SALGADO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "IVONNE SALAS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JACKELINE GRACE LARA CAMPOS","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JACQUELINE H DIAZ GARZA","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "JAIME ALONSO RESENDIZ COLOSIA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JAIME ARTURO GUEL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JAIME CORONA RIVERA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JAIME J. TAMEZ SALAZAR","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JAIME NAVARRETE ALEMAN","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JAIME SHALKOW KLINCOVSTEIN.","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JANETT CABALLERO JASSO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JANISSE KERSHENOVICH GERSSON","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "RICARDO FERNANDEZ FERREIRA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JAQUELINE AGUIRRE GOMEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JAVIER GARCIA ESTRADA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JAVIER KELLY GARCIA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JAVIER LOPEZ GOMEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JAVIER MELCHOR RUAN","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JAZMIN FIGUEROA BADILLO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JENNIFER RAMIREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JERONIMO RAFAEL RODRIGUEZ CID","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JESSICA SALAZAR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JESUS ALBERTO LIMON RODRIGUEZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JESUS ALICIA ACOSTA ESPINOZA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JESUS ARMANDO SANCHEZ GONZALEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JESUS ELVIS CABRERA LUVIANO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JESUS MIGUEL LAZARO LEON","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JESUS RICO GUTIERREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JHONATAN BUENO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOEL BAÑUELOS FLORES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JONATHAN RUBEN CEDILLO RODRIGUEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JORGE ADAN ALEGRIA BAÑOS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JORGE ALBERTO GUADARRAMA OROZCO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JORGE ALBERTO HERNANDEZ SALAZAR","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JORGE ALBERTO ROBLES AVIÑA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JORGE ALBERTO SALAZAR ANDRADE","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JORGE ALEJANDRO CASTAÑEDA AVILA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JORGE ANTONIO MACIAS MILLAN","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JORGE ARMANDO CASTELAN PEDRAZA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JORGE ARTURO ALATORRE ALEXANDER","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JORGE BERMUDEZ LUGO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JORGE EMILIO ARCH FERRER","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JORGE ENRIQUE MONGES JONES","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JORGE LUIS CORTES RUBIO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JORGE LUIS MARTINEZ RODRIGUEZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JORGE LUIS MARTINEZ TLAHUEL","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JORGE MANUEL RUANO AGUILAR","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JORGE MARTINEZ CEDILLO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JORGE MAYORGA ACUÑA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JORGE SAID GARCIA BAUTISTA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JOSAFAT RAMIREZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JOSE ADALBERTO TORIZ HERNANDEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JOSE AGUIRRE TRIGUERO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE ALBERTO ABREGO VASQUEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JOSE ANTONIO ACEVEDO DELGADO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE ANTONIO BAHENA GONZALEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE ANTONIO POSADA TORRES","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JOSE ANTONIO TREJO PANTOJA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE DE JESUS CURIEL VALDES","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE EUGENIO VAZQUEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JOSE FABIAN MARTINEZ HERRERA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JOSE FRANCISCO ALEXANDER MEZA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE FRANCISCO CORONA CRUZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE FRANCISCO GALLEGOS HERNANDEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE GABRIEL CHAVEZ SANCHEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JOSE GABRIEL PEÑALOZA GONZALEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE GADU CAMPOS SALCEDO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE GERARDO VELAZQUEZ OLGUIN","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JOSE GUSTAVO NUÑEZ CARRILLO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JOSE JOB LAGUNES MUÑOZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSÉ JOB LAGUNES MUÑOZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE JUAN RAMIREZ JAIME","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSÉ LENIN BELTRÁN","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "JOSE LUIS AGUILAR PONCE","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE LUIS ALVAREZ VERA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JOSE LUIS GONZALEZ TRUJILLO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSÉ LUIS GONZÁLEZ TRUJILLO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE LUIS GUZMAN MURGIA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "JOSE LUIS LOPEZ LOPEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JOSE LUIS VELA GONZALEZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "SERGIO ALEJANDRO ARREOLA VALDEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE LUIS ZARAGOZA H.","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSE MANUEL ARTURO RUANO AGUILAR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JOSE MANUEL RUIZ MORALES","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE ROBERTO JUAREZ DIAZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JOSE RODRIGO ESPINOSA FERNANDEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JOSE ROGELIO GONZALEZ RAMIREZ BENFIELD","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JOSEPH XAVIER LOPEZ KARKPOVITCH","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JUAN ADNAN CRUZ VALENZUELA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JUAN ALBERTO SERRANO OLVERA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JUAN ALBERTO TENORIO TORRES","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JUAN ALEJANDRO SILVA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JUAN ANTONIO DELGADO VÁZQUEZ","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "JUAN ANTONIO MATUS SANTOS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JUAN CARLOS HERNANDEZ FONSECA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JUAN CARLOS OLIVA POSADA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JUAN CARLOS VAZQUEZ LIMON","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "JUAN CARLOS ZAPOT MARTINEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JUAN DE DIOS PEREZ VILLEGAS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JUAN FERNANDO ARAGON SANCHEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JUAN FRANCISCO GONZALEZ GUERRERO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JUAN LORENZO ESPINO VILLALOBOS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JUAN LUIS ABOITES LUCERO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "JUAN MANUEL STETA OROZCO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "JUAN MANUEL VARELA GAYOL","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "JUAN PABLO FEREGRINO ARREOLA","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "JUAN WOLFGANG ZINZER SIERRA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JULIO CESAR ABITIA CASTRO","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "JULIO CESAR VELASCO RODRIGUEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "JULIO EDUARDO MARTINEZ SAMANO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "JUSTO GONZALO MILAN REVOLLO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "KARINA MURILLO MEDINA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "KARLA BELEN MOLINA TABAREZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "KARLA SUSANA MARTIN TELLEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "KATHIA SUSANA ZAMUDIO OSUNA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "KELLY GARCIA JAVIER","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "KUAUHYAMA LUNA ORTIZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "LAURA GABRIELA FLORES PEÑA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LAURA PEREZ MICHEL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LAURA TORRECILLAS TORRES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "LENNY NADIA GALLARDO ALVARADO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LEONARDO VERDUZCO RODRIGUEZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "LEONORA VALDEZ ROJAS","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "LEOPOLDO ABRAHAM LUGO ALFEREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LEOPOLDO GUZMAN NAVARRO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "LETICIA ELIZABETH MOTA GARDUÑO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LETICIA VAZQUEZ CORTES","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "LIDO JOSE MANUEL GOMEZ GLEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "LIGIA LARRALDE","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "LIZ NAVA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LIZBETH HANAYANSI FLORES RUIZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "LIZBETH VANESSA GARCÍA MONTES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LUCELY DEL CARMEN CETINA PEREZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "LUIIS ANTONIO NUÑEZ TRENADO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LUIS ALBERTO GARCIA GONZALEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "LUIS ANTONIO CABRERA MIRANDA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "LUIS ANTONIO CANCEL TREVIÑO","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "LUIS ANTONIO LARA MEJIA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "LUIS ANTONIO MEILLON GARCIA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "LUIS ARTURO CARDOSO APARICIO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LUIS ARTURO HERNANDEZ LOPEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LUIS CRUZ BENITEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LUIS ENRIQUE JUAREZ VILLEGAS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LUIS ENRIQUE SOTO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LUIS FERNANDO PEREZ JACOBO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LUIS GERARDO MOTA CIENFUEGOS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LUIS JAVIER BARAJAS FIGUEROA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LUIS JHONATAN BUENO ROSARIO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "LUIS JONATHAN BUENO ROSARIO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "LUISA FERNANDA MARISCAL MENDIZABAL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "LUZ MARIA HINOJOSA GARCIA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "LUZ MARIA RIVAS CORCHADO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MA DE LOURDES GUTIERREZ RIVERA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MA DELIA PEREZ MONTIEL","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MA ISABEL ENRIQUEZ ACEVES","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "MANUEL ACUÑA TOVAR","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MANUEL ALONSO VILLEGAS MARTINEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MANUEL GONZALEZ REYES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MANUEL ISMAEL GONZALEZ GERONIZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "MANUEL MAGALLANES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MANUEL ROBERTO MORALES POLANCO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MARA NUÑEZ TOSCANO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MARCELINO MORALES RIVERA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARCELINO RAMIREZ MARQUEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARCO ANTONIO DE LA ROSA ABAROA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "MARCOS FABIAN MONZALVO HERNANDEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "MARCOS LOPEZ NAVEDA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARGARITA CAMPUZANO BUENROSTRO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA ANDREA BARBERO IBARROLA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MARIA CRISTINA AGUILAR MARTINEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARÍA CRISTINA AGUILAR MARTÍNEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA DE LA LUZ GARCA TINOCO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARIA DEL CONSUELO DIAZ ROMERO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MARIA DEL MAR GARCIA ORTEGA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARIA DEL ROSARIO ESTRADA FALCON","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA DEL SOCORRO RIO MERCADO","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA DOLORES DE LA MATA MOYA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "MARÍA DOLORES DE LA MATA MOYA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MARIA DOLORES SALAS AGUIRRE","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA ELISA OTEIRO CERDEIRA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA EUGENIA SALINAS NIEVES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA FATIMA CHILACA ROSAS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MARIA GUADALUPE DOMINGUEZ DELGADO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA GUADALUPE VILLA GRAJEDA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "MARIA GUADLUPE CERVANTES SANCHEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARIA HELENA VILLALOBOS GOMEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIA LUISA ROMERO LAGUNES","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "MARIA PAULA HERNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARIA PAZ COVARRUBIAS RODRIGUEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "MARIA TERESA BOURLON DE LO RIOS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "MARIA TERESA CERVANTES DIAZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARIANA MONSERRAT GOMEZ JARA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARICELA GARCIA GARCES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARINEE TORRES AGUILAR","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIO CUELLAR HUBBE","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "MARIO EDUARDO ALONSO CALAMACO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MARIO SANCHEZ CORZO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "MARISOL RIVERA HERNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MARLID CRUZ RAMOS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MARTHA GABRIELA TAVERA RODRIGUEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MARYTERE HERRERA MARTINEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MAURICIO ANTUAN CANAVATI MARCOS","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "MAXWELL AVILES RODRIGUEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MAYRA CRISTINA GALEANA HERNANDEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MELANIA ABREU GONZALEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MICHEL BONIFANT","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MICHEL HERNANDEZ VALADEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MIGUEL ANGEL ALVAREZ AVITIA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MIGUEL ANGEL ARAUJO MELENDEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "MIGUEL ANGEL LOPEZ VALLE","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MIGUEL ANGEL MONROY RAMIREZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MIGUEL ANGEL TLETLEPANTZIN APARTADO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "MIGUEL ARNOLDO FARIAS ALARCON","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "MIGUEL CORRES MOLINA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MIGUEL NORIEGA JUAREZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MIJAEL TOIBER LEVY","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MILAGROS PEREZ QUINTANILLA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MINOR CORDERO B.","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "MOISES ZEFERINO TOQUERO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "MONICA ISABEL MENESES MEDINA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "MYRNA GLORIA CANDELARIA HERNANDEZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "NATIVIDAD NERI MUÑOZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "NEREIDA ESPARZA ARIAS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "NICOLAS RICARDO DE JESUS SANCHEZ CASAS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "NICOLE MARIE IÑIGUEZ ARIZA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "NIDIA PAULINA ZAPATA CANTO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "NOE FLORES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "NORA HILDA CHAVEZ HERNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "NORA MARIA PEREZ HRNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "NORA SOBREVILLA MORENO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "NORMA CANDELARIA LOPEZ SANTIAGO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "NOVELTHYS VELASCO CORTES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "ODILON FELIX QUIJANO CASTRO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "OMAR ALEJANDRO ZAYAS VILLANUEVA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "OMAR CHAVEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "OMAR DE LEON PACHECO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "OMAR FRANCISCO CORONEL AYALA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "OMAR MACEDO PEREZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "OMAR PEÑA CURIEL","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "OMAR SPENCER AGUILAR REYES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "OSCAR ALEJANDRO GOMEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "OSCAR ARMANDO MELHADO ORELLANA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "OSCAR GERARDO ARRIETA RODRIGUEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "OSCAR SALVADOR SANCHEZ VELAZQUEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "OSCAR VIDAL GUTIERREZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "OSVALDO HERNANDEZ FLORES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "OSVALDO QUIROZ SANDOVAL","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "OTONIEL LOPEZ RIVEROL","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "PABLO GALLO STETA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "PAMELA AYALA HERNANDEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "PATRICIA CORTES ESTEBAN","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "PATRICIA GRETHER GONZALEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "PATRICIA PADILLA ARRIETA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "PATRICIO AZAOLA ESPINOZA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "PAULA ANEL CABRERA GALEANA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "PEDRO DE JESUS SOBREVILLA CALVO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "PEDRO LUNA MERLOS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "PEDRO LUNA PEREZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "PEDRO ROBLES NOLAZCO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "RAFAEL BRICEÑO HERNANDEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "RAFAEL HURTADO MONROY","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "RAFAEL MEDRANO GUZMAN","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "RAFAEL PADILLA LONGORIA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "RAFAEL VAZQUEZ ROMO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "RAMIRO GARCIA ORTIZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "RAMIRO MAGANA SERRANO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "RAMON JESUS MARTELL GUERRERO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "RAMSÉS ALBERTO CASTILLO CHIQUETE","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "RAQUEL GERSON CWILICH","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "RAUL ARTGUZMAN TRIGUEROS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "RAUL GARZA GARZA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "RAUL GERARDO RAMIREZ MEDINA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "RENE GOMEZ CERDA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "RICARDO CAVAZOS GARCIA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "RICARDO CAVAZOS GARCÍA","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ROBERTO ALFARO LARA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ROBERTO DE LA PENA LOPEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ROBERTO ENRIQUE HERNANDEZ PEÑA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ROBERTO KURI EXSOME","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "ROBERTO RIVERA LUNA","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ROBIN JENNIFER SHAW DULIN","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ROCIO CRYSTAL GRAJALES ALVAREZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ROCIO DEL SOCORRO CARDENAS CARDOS","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "RODRIGO ARRANGOIZ MAJUL","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "RODRIGO DIAZ MACHORRO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "RODRIGO YAHEL ADAME MORENO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ROGELIO LOZANO GALVAN","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ROGELIO MARTINEZ MACIAS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "ROLANDO MARTINEZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "ROMMEL IVAN RODRIGUEZ SIMENTAL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "RONNY KERSHENOVICH SEFCHOVICH","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ROSA HIMELDA ARELLANO BERNAL","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "ROSA LUZ LUNA PLACENCIA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "ROSARIO MARISOL QUINTERO SOLIS","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "RUBEN CORTES GONZALEZ","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "RUBI JANDAY NAJERA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "RAUL ROGELIO TREJO ROSALES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "SALIM ABRAHAM BARQUET MUÑOZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "SALVADOR MACIAS DIAZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "SALVADOR NAVARRO HERNANDEZ","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "SAMANTHA LOPEZ RAMIREZ","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SAMUEL RIVERA RIVERA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "SANTA MARICELA ORTIZ ZEPEDA","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SANTIAGO ALEJANDRO CANO CANCELA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "SANTOS GILBERTO SOTO GERMES","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SARA OLIVIA RAMOS ROMERO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SARISH DEL REAL ORDOÑEZ","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "SAUL CAMPOS GOMEZ","KAM": "ANAYELI Y MEMO","TELEFONO KAM": "5579681304"},{"Doctor": "SEBASTIAN GARCIA HERRERA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "SEIR ALFONSO CORTES CARDENAS","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "SERGIO AGUILAR VILLANUEVA","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "SERGIO ALEJANDRO ARREOLA","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "SERGIO CARLOS RODRIGUEZ BAHENA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "SERGIO CESAR LOPEZ GARCI A","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SERGIO PEDRAZA BARAJAS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "SERGIO RODRIGUEZ-CUEVAS","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SERGIO TORRES VARGAS","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "SERGIO YASPIK FLORES","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "SERVANDO CARDONA HUERTA","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "SIGMUND RODRIGUEZ ROJAS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "SILVIA MARGARITA ALVARFEZ MALDONADO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "SILVIA NATALIA LOPEZ HERNANDEZ","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "SILVIA PATRICIA VILLAREAL COLIN","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "SOCORRRO RÍOS MERCADO","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "SUSANA MONROY SANTOYO","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "TALIA WEGMAN OSTROSKY","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "TALINA RAMIREZ CARO","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "TANIA ALVAREZ DOMINGUEZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "TOMAS PINEDA RAZO","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "VANESSA ROSAS CAMARGO","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "VICTOR ALFONSO MARTINEZ DIAZ","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "VICTOR HUGO CARMONA ORNELA S","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "VICTOR MANUEL CORREA SANTILLAN","KAM": "SIN ASIGNAR","TELEFONO KAM": "5543401015"},{"Doctor": "VICTOR MANUEL MARROQUIN TORRES","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "VICTOR MANUEL OYERVIDES JUAREZ","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "VICTOR RAMON ANDRADE SEPULVEDA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "WENDY ROSANGELA MARTINEZ TORRES","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "WENDY ROSSEMARY MUÑOZ MONTAÑO","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "XIMENA FERNANDEZ SOTO","KAM": "CLAUDIA","TELEFONO KAM": "5554360130"},{"Doctor": "XINOTECATL JIMENEZ VILLANUEVA","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "YADIRA BERENICE MELCHOR VIDAL","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "YAMILE TORRES JASSO","KAM": "BERENICE","TELEFONO KAM": "5580126718"},{"Doctor": "YANIN CHAVARRI GUERRA","KAM": "OSCAR","TELEFONO KAM": "5579681460"},{"Doctor": "YAZMIN CAROLINA BLANCO VAZQUEZ","KAM": "MARYMAR Y MEMO","TELEFONO KAM": "5569988684"},{"Doctor": "YAZMIN HERNÁNDEZ BALDERAS","KAM": "MARYMAR","TELEFONO KAM": "5543401015"},{"Doctor": "YOLANDA LIZBETH BAUTISTA ARAGON","KAM": "ANAYELI","TELEFONO KAM": "5579681304"},{"Doctor": "YURIDIA ALVARADO BERNAL","KAM": "ALAIN","TELEFONO KAM": "5564822884"},{"Doctor": "YVETTE NEME YUNES","KAM": "DAYANA","TELEFONO KAM": "5569988684"},{"Doctor": "ZULEIMA GARCIA NIETO","KAM": "BERENICE","TELEFONO KAM": "5580126718"}];
const ASEG = ["PARTICULAR (PAGO DE BOLSILLO)","ALLIANZ","AXA SEGUROS","BANCO DEL BIENESTAR","BANCOMEXT","BANJÉRCITO","BANRURAL","BEST DOCTORS CLAIMS CENTER","BUPA MEXICO COMPAÑÍA DE SEGUROS","CNBV","GNP","HSBC JUBILADOS Y PENSIONADOS","HSBC-EDPM (ACTIVOS)","INDEP","LUZ Y FUERZA JUBILADOS","MAPFRE","METLIFE","NAFIN //NACIONAL FINANCIERRA","OMA ATLANTIS","PAN-AMERICAN","PLAN SEGURO","PREVEM SEGUROS","PROSESO","PUNTO PEN","SEGUROS ATLAS","SEGUROS BANORTE","SEGUROS INBURS","SEGUROS MONTERREY NEW YORK LIFE","SEGUROS SURA","SEGUROS VE POR MÁS","SHF","SOLUGLOB IKON","ZURICH","VUMI"];

// === Utilidades y estado ===
const fmt = n => (Number(n)||0).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
const dom = sel => document.querySelector(sel);

// Teléfonos por listado (según CONFIG)
const TEL = {"gestion_nomad":"55 5255 8403","gestion_comercial":"55 43 40 10 15","gnp":"55 79 68 13 04","dra_genoveva":"55 79 68 13 04"};

let DATA = {pruebas:[]};

// === Inicialización ===
function setFechas() {
  const emision = dom('#fechaEmision');
  const validez = dom('#fechaValidez');
  const hoy = new Date();

  // Obtener fecha local (YYYY-MM-DD)
  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, '0');
  const dd = String(hoy.getDate()).padStart(2, '0');
  const fechaLocal = `${yyyy}-${mm}-${dd}`;

  emision.value = fechaLocal;

  // Validez +15 días
  const validezDate = new Date(hoy);
  validezDate.setDate(hoy.getDate() + 15);
  const yyyy2 = validezDate.getFullYear();
  const mm2 = String(validezDate.getMonth() + 1).padStart(2, '0');
  const dd2 = String(validezDate.getDate()).padStart(2, '0');
  validez.value = `${yyyy2}-${mm2}-${dd2}`;
}

function actualizarTelefonoPorListado(listado) {
  dom('#telefono').textContent = "Teléfono: " + (TEL[listado] || "");
}

function poblarAseguradoras() {
  const selA = dom('#aseguradora');
  selA.innerHTML = '<option value="">Selecciona…</option>' + ASEG.map(a=>`<option value="${a}">${a}</option>`).join('');
}

function poblarMedicos(lista) {
  const selMed = dom('#medico');
  selMed.innerHTML = '<option value="">Selecciona…</option>' + 
    (lista||MEDICOS).map(m=>`<option value="${m["Doctor"]}">${m["Doctor"]}</option>`).join('');
}

function setupBuscadores() {
  const inputMed = dom('#buscarMedico');
  const selMed = dom('#medico');
  const inputKam = dom('#buscarKam');
  const inputAseg = dom('#buscarAseg');
  const selA = dom('#aseguradora');

  // Buscar médico
  inputMed.addEventListener('input', ()=>{
    const q = (inputMed.value||'').toLowerCase();
    const filtrados = MEDICOS.filter(m=>m["Doctor"].toLowerCase().includes(q));
    poblarMedicos(filtrados);
  });

  // Selección de médico → KAM
  selMed.addEventListener('change', ()=>{
    const m = MEDICOS.find(x=>x["Doctor"]===selMed.value);
    dom('#kam').value = m ? (m["KAM"] || '') : '';
  });

  // Buscar por KAM
  inputKam.addEventListener('input', ()=>{
    const q = (inputKam.value||'').toLowerCase();
    const filtrados = MEDICOS.filter(m=>(m["KAM"]||'').toLowerCase().includes(q));
    poblarMedicos(filtrados);
  });

  // Buscar aseguradora
  inputAseg.addEventListener('input', ()=>{
    const q = (inputAseg.value||'').toLowerCase();
    const filtradas = ASEG.filter(a => a.toLowerCase().includes(q));
    selA.innerHTML = '<option value="">Selecciona…</option>' + filtradas.map(a=>`<option value="${a}">${a}</option>`).join('');
  });
}

function cargarListado(listado) {
  DATA = {
    pruebas: DATASETS[listado] || [],
    biomarcadores: (BIOMARCADORES[listado] || [])
  };
  poblarPruebas();
  poblarBiomarcadores();
  actualizarTelefonoPorListado(listado);
}

function poblarPruebas() {
  const sel = dom('#selPrueba');
  const buscar = dom('#buscarPrueba');
  const orden = dom('#ordenPruebas');
  let items = [...(DATA.pruebas||[])];

  function render() {
    let q = (buscar.value||'').toLowerCase();
    let filtered = items.filter(p => (p.nombre||'').toLowerCase().includes(q));
    if (orden.value==='precio') filtered.sort((a,b)=>(b.precio||0)-(a.precio||0));
    else filtered.sort((a,b)=>(a.nombre||'').localeCompare(b.nombre||'', 'es'));
    sel.innerHTML = filtered.map(p=>`<option value="${p.nombre}" data-precio="${p.precio||0}">${p.nombre} — ${fmt(p.precio||0)}`)
      .join('');
  }
  buscar.addEventListener('input', render);
  orden.addEventListener('change', render);
  render();
}

function addLinea(nombre, precio, cant){
  const tb = dom('#tablaPruebas tbody');
  const row = document.createElement('tr');
  const subtotal = (precio||0) * (cant||1);
  row.innerHTML = `
    <td>${nombre}</td>
    <td>${cant}</td>
    <td>${fmt(precio||0)}</td>
    <td>${fmt(subtotal)} </td>
    <td><button class="btn-eliminar">Eliminar</button></td>`;
  row.querySelector('.btn-eliminar').addEventListener('click', ()=>{ 
    row.remove(); 
    calcTotales(); 
    updateNormalMatchOption();
  });
  tb.appendChild(row);
  calcTotales();
  updateNormalMatchOption();
}


function calcTotales(){
  let subtotal = 0;
  document.querySelectorAll('#tablaPruebas tbody tr').forEach(tr=>{
    const val = tr.children[3].textContent.replace(/[^0-9.,-]/g,'').replace(',','');
    subtotal += Number(val);
  });
  const iva = subtotal * 0.16;
  dom('#subtotal').textContent = fmt(subtotal);
  dom('#iva').textContent = fmt(iva);
  dom('#total').textContent = fmt(subtotal + iva);
}

function setupAgregar(){
  dom('#addPrueba').addEventListener('click', ()=>{
    const sel = dom('#selPrueba');
    if(!sel.value) return;
    const precio = Number(sel.options[sel.selectedIndex].dataset.precio||0);
    const cant = Number(dom('#cantPrueba').value||1);
    addLinea(sel.value, precio, cant);
  });
}


function poblarBiomarcadores(){
  const sel = dom('#selBiomarcador');
  if(!sel) return;
  const items = (DATA.biomarcadores||[]);
  sel.innerHTML = items.map(b=>`<option value="${b.nombre}" data-precio="${b.precio||0}">${b.nombre} — ${fmt(b.precio||0)}</option>`).join('');
  updateNormalMatchOption();
}


function updateNormalMatchOption(){
  const sel = dom('#selBiomarcador');
  if(!sel) return;

  const hasTempusXtXr = Array.from(document.querySelectorAll('#tablaPruebas tbody tr td:first-child'))
    .some(td => (td.textContent||'').replace(/\s+/g,' ').trim().toLowerCase() === 'tempus xt + xr');

  const opts = Array.from(sel.options);
  const hasOpt = opts.some(o => (o.value||'').trim().toLowerCase() === 'normal match');

  if(hasTempusXtXr && !hasOpt){
    const opt = document.createElement('option');
    opt.value = 'NORMAL MATCH';
    opt.setAttribute('data-precio','0');
    opt.textContent = `NORMAL MATCH — ${fmt(0)}`;
    sel.appendChild(opt);
  }else if(!hasTempusXtXr && hasOpt){
    opts.forEach(o=>{
      if((o.value||'').trim().toLowerCase() === 'normal match') o.remove();
    });
  }
}


function setupBiomarcadores(){
  const btn = dom('#addBiomarcador');
  const sel = dom('#selBiomarcador');
  if(!btn || !sel) return;
  btn.addEventListener('click', ()=>{
    const opt = sel.selectedOptions[0];
    if(!opt) return;
    const nombre = opt.value;
    let precio = Number(opt.getAttribute('data-precio')||0);

    // Regla especial: si hay cualquier prueba "Foundation" en la tabla y se agrega este biomarcador,
    // forzar el precio a $5,000.00 (sin afectar otros rubros)
    const tieneFoundation = Array.from(document.querySelectorAll('#tablaPruebas tbody tr td:first-child'))
      .some(td => (td.textContent||'').toLowerCase().includes('foundation'));
    if(tieneFoundation && (nombre||'').trim().toLowerCase() === 'pdl1 sp263 y 22c3'.toLowerCase()){
      precio = 5000.00;
    }

    // Regla especial: NORMAL MATCH solo aplica si está seleccionada la prueba "Tempus xT + xR"
    const tieneTempusXtXr = Array.from(document.querySelectorAll('#tablaPruebas tbody tr td:first-child'))
      .some(td => (td.textContent||'').replace(/\s+/g,' ').trim().toLowerCase() === 'tempus xt + xr');
    if((nombre||'').trim().toLowerCase() === 'normal match'){
      if(!tieneTempusXtXr){
        alert('NORMAL MATCH solo aplica para Tempus xT + xR.');
        return;
      }
      precio = 0;
    }

    addLinea(nombre, precio, 1);
  });
}

function setupListado(){
  const listado = dom('#listado');
  listado.addEventListener('change', ()=> cargarListado(listado.value));
  cargarListado(listado.value);
}


function setupPDF(){
  const btn = document.getElementById('btnPDF');
  btn.addEventListener('click', async ()=>{
    const pacienteRaw = (document.getElementById("paciente").value || "SinNombre").trim();
    const paciente = pacienteRaw.replace(/\s+/g,""); // remove spaces
    let fechaEmision = document.getElementById("fechaEmision").value;
    if(!fechaEmision){
      const d=new Date();
      fechaEmision = d.getDate()+"-"+(d.getMonth()+1)+"-"+d.getFullYear();
    } else {
      fechaEmision = fechaEmision.replace(/\//g,"-");
    }
    const usuario = localStorage.getItem("usuarioActual") || "nomad";
    const folio = await getNextFolio();
    // Guardar en Firestore si está disponible
    try {
      if (window.saveCotizacion) {
        const payload = getCotizacionPayloadNomad(folio);
        window.saveCotizacion(payload);
      }
    } catch (e) {
      console.warn('No se pudo guardar la cotización en Firebase', e);
    }
    // Mostrar folio en UI antes de captura
    const folioText = document.getElementById("folioText"); if(folioText) folioText.textContent = folio;
    const nombreArchivo = `Nomad-${paciente}-${fechaEmision}-Folio${folio}.pdf`;
const { jsPDF } = window.jspdf;
    const el = document.getElementById('cotizador');
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      onclone: (doc)=> {
        // Ocultar elementos en el DOM clonado para el PDF
        doc.querySelectorAll('.datos, #listado, .linea.derecha.fechas, select, input, button, #ordenPruebas, #buscarPrueba, .btn-eliminar, #btnPDF')
          .forEach(e=>{ e.style.display='none'; });
        // Asegurar que el bloque de fechas para PDF esté visible
        const f = doc.querySelector('.fechas-pdf');
        if (f) f.style.display = 'block';
      }
    });
    const img = canvas.toDataURL('image/jpeg', 0.7);
    const pdf = new jsPDF('p','mm','a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let imgWidth = pageWidth;
    let imgHeight = canvas.height * imgWidth / canvas.width;
    if (imgHeight > pageHeight) {
      const ratio = pageHeight / imgHeight;
      imgWidth *= ratio; imgHeight *= ratio;
    }
    const x = (pageWidth - imgWidth)/2;
    pdf.addImage(img, 'JPEG', x, 0, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(nombreArchivo);
    await sendToSheet({folio, paciente: pacienteRaw, fecha: fechaEmision, usuario});
  });
}


document.addEventListener('DOMContentLoaded', ()=>{
    setupBiomarcadores();
  setFechas();
  poblarAseguradoras();
  poblarMedicos(MEDICOS);
  setupBuscadores();
  setupListado();
  poblarPruebas();
  setupAgregar();
  setupPDF();
});


// Actualización automática del resumen
function bindResumen() {
  const map = [
    {input: 'nombrePaciente', output: 'rPaciente'},
    {input: 'buscarMedico', output: 'rMedico'},
    {input: 'buscarAseguradora', output: 'rAseguradora'},
    {input: 'buscarKam', output: 'rKam'},
    {input: 'diagnostico', output: 'rDiagnostico'},
    {input: 'fechaProgramacion', output: 'rFecha'}
  ];

  map.forEach(m => {
    const inp = document.getElementById(m.input);
    const out = document.getElementById(m.output);
    if (inp && out) {
      inp.addEventListener('input', e => { out.textContent = e.target.value; });
      inp.addEventListener('change', e => { out.textContent = e.target.value; });
    }
  });
}

document.addEventListener('DOMContentLoaded', bindResumen);


// === Resumen automático ===
function updateResumen() {
  var get = id => document.getElementById(id);
  var val = el => el ? (el.tagName === 'SELECT' ? (el.options[el.selectedIndex] ? el.options[el.selectedIndex].text : el.value) : el.value) : '';
  var set = (id, text) => { var el = get(id); if (el) el.textContent = text || ''; };

  set('rPaciente', val(get('paciente')));
  set('rMedico', val(get('medico')));
  set('rAseguradora', val(get('aseguradora')));
  set('rKam', val(get('kam')));
  set('rDx', val(get('dx')));
  set('rFecha', val(get('fecha')));
}

function bindResumen() {
  ['paciente','medico','aseguradora','kam','dx','fecha','buscarMedico','buscarAseg','buscarKam'].forEach(id=>{
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', ()=>{ setTimeout(updateResumen,0); });
    el.addEventListener('change', ()=>{ setTimeout(updateResumen,0); });
  });
  // primera sincronización
  updateResumen();
}

document.addEventListener('DOMContentLoaded', bindResumen);


// === Actualizar fechas en PDF ===
function updateFechasPDF() {
  var em = document.getElementById("fechaEmision");
  var va = document.getElementById("fechaValidez");
  var rp = document.getElementById("realizadoPor");
  if (em) document.getElementById("rFechaEmision").textContent = em.value;
  if (va) document.getElementById("rFechaValidez").textContent = va.value;
  if (rp) document.getElementById("rRealizadoPor").textContent = rp.value;
}

["fechaEmision","fechaValidez","realizadoPor"].forEach(id=>{
  var el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", updateFechasPDF);
    el.addEventListener("change", updateFechasPDF);
  }
});
document.addEventListener("DOMContentLoaded", updateFechasPDF);



// === Login flotante ===
function doLogin() {
  const user = document.getElementById("loginUser").value;
  const pass = document.getElementById("loginPass").value;

  // Lista de usuarios válidos
  const users = {
    "admin": "1234",
    "sanare": "5678",
    "ventas": "abcd",
    "kam1": "kam123",
    "kam2": "kam456"
  };

  if (users[user] && users[user] === pass) {
    document.getElementById("loginOverlay").style.display = "none";
  } else {
    document.getElementById("loginError").style.display = "block";
  }
}

// Revisar sesión al cargar
document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("loginOverlay"); if (overlay) overlay.style.display = "flex";
});


// === Add-ons ===
function findMedico(nombre){
  if(!nombre) return null;
  const n = nombre.trim().toLowerCase();
  return MEDICOS.find(m => (m.Doctor||'').toLowerCase() === n) || null;
}
function setKAMAndPhoneFromMedico(nombre){
  const m=findMedico(nombre);
  const kamInput=document.getElementById('kam');
  const tel=document.getElementById('telefono');
  const wa=document.getElementById('waLink');
  if(m){
    if(kamInput) kamInput.value=m.KAM||'';
    if(tel) tel.textContent=m["TELEFONO KAM"]||'';
    if(wa){ let num=(m["TELEFONO KAM"]||'').replace(/[^0-9]/g,''); wa.href=num?`https://wa.me/52${num}`:'#'; }
  }else{
    if(kamInput) kamInput.value='';
    if(tel) tel.textContent='';
    if(wa) wa.href='#';
  }
}
document.getElementById('medico').addEventListener('change',e=>setKAMAndPhoneFromMedico(e.target.value));
// Folio counter
(function(){
  const KEY='nomad_quote_counter';
  let n=parseInt(localStorage.getItem(KEY)||'0'); if(isNaN(n)) n=0;
  n+=1; localStorage.setItem(KEY,n);
  const el=document.getElementById('folioCotizacion');
  if(el) el.textContent=`Nomad-${String(n).padStart(2,'0')}`;
})();
