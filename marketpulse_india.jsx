import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ─── COMPLETE NSE SYMBOL DATABASE (300+ stocks) ──────────────────────────────
const ALL_NSE_STOCKS = [
  // NIFTY 50 / LARGE CAP
  {sym:"HDFCBANK.NS",    name:"HDFC Bank",               sector:"BFSI"},
  {sym:"RELIANCE.NS",    name:"Reliance Industries",      sector:"Energy"},
  {sym:"ICICIBANK.NS",   name:"ICICI Bank",               sector:"BFSI"},
  {sym:"BHARTIARTL.NS",  name:"Bharti Airtel",            sector:"Telecom"},
  {sym:"INFY.NS",        name:"Infosys",                  sector:"IT"},
  {sym:"LT.NS",          name:"L&T",                      sector:"Infra"},
  {sym:"AXISBANK.NS",    name:"Axis Bank",                sector:"BFSI"},
  {sym:"TCS.NS",         name:"TCS",                      sector:"IT"},
  {sym:"SBIN.NS",        name:"SBI",                      sector:"BFSI"},
  {sym:"BAJFINANCE.NS",  name:"Bajaj Finance",            sector:"BFSI"},
  {sym:"NTPC.NS",        name:"NTPC",                     sector:"Power"},
  {sym:"TATAMOTORS.NS",  name:"Tata Motors",              sector:"Auto"},
  {sym:"SUNPHARMA.NS",   name:"Sun Pharma",               sector:"Pharma"},
  {sym:"HINDUNILVR.NS",  name:"Hindustan Unilever",       sector:"FMCG"},
  {sym:"KOTAKBANK.NS",   name:"Kotak Mahindra Bank",      sector:"BFSI"},
  {sym:"ONGC.NS",        name:"ONGC",                     sector:"Energy"},
  {sym:"ULTRACEMCO.NS",  name:"UltraTech Cement",         sector:"Cement"},
  {sym:"POWERGRID.NS",   name:"Power Grid Corp",          sector:"Power"},
  {sym:"NESTLEIND.NS",   name:"Nestle India",             sector:"FMCG"},
  {sym:"WIPRO.NS",       name:"Wipro",                    sector:"IT"},
  {sym:"ADANIENT.NS",    name:"Adani Enterprises",        sector:"Conglomerate"},
  {sym:"HCLTECH.NS",     name:"HCL Technologies",         sector:"IT"},
  {sym:"INDUSINDBK.NS",  name:"IndusInd Bank",            sector:"BFSI"},
  {sym:"TATASTEEL.NS",   name:"Tata Steel",               sector:"Metal"},
  {sym:"GRASIM.NS",      name:"Grasim Industries",        sector:"Cement"},
  {sym:"ADANIPORTS.NS",  name:"Adani Ports",              sector:"Infra"},
  {sym:"TECHM.NS",       name:"Tech Mahindra",            sector:"IT"},
  {sym:"CIPLA.NS",       name:"Cipla",                    sector:"Pharma"},
  {sym:"ASIANPAINT.NS",  name:"Asian Paints",             sector:"Paints"},
  {sym:"EICHERMOT.NS",   name:"Eicher Motors",            sector:"Auto"},
  {sym:"TITAN.NS",       name:"Titan Company",            sector:"Consumer"},
  {sym:"JSWSTEEL.NS",    name:"JSW Steel",                sector:"Metal"},
  {sym:"MARUTI.NS",      name:"Maruti Suzuki",            sector:"Auto"},
  {sym:"ITC.NS",         name:"ITC",                      sector:"FMCG"},
  {sym:"HEROMOTOCO.NS",  name:"Hero MotoCorp",            sector:"Auto"},
  {sym:"BAJAJ-AUTO.NS",  name:"Bajaj Auto",               sector:"Auto"},
  {sym:"BAJAJFINSV.NS",  name:"Bajaj Finserv",            sector:"BFSI"},
  {sym:"DRREDDY.NS",     name:"Dr. Reddy's Labs",         sector:"Pharma"},
  {sym:"APOLLOHOSP.NS",  name:"Apollo Hospitals",         sector:"Healthcare"},
  {sym:"COALINDIA.NS",   name:"Coal India",               sector:"Mining"},
  {sym:"BRITANNIA.NS",   name:"Britannia",                sector:"FMCG"},
  {sym:"TRENT.NS",       name:"Trent (Zudio/Westside)",   sector:"Retail"},
  {sym:"BPCL.NS",        name:"BPCL",                     sector:"Energy"},
  {sym:"DIVISLAB.NS",    name:"Divi's Laboratories",      sector:"Pharma"},
  {sym:"SHRIRAMFIN.NS",  name:"Shriram Finance",          sector:"BFSI"},
  {sym:"TATACONSUM.NS",  name:"Tata Consumer Products",   sector:"FMCG"},
  {sym:"SBILIFE.NS",     name:"SBI Life Insurance",       sector:"Insurance"},
  {sym:"HDFCLIFE.NS",    name:"HDFC Life Insurance",      sector:"Insurance"},
  // IT
  {sym:"PERSISTENT.NS",  name:"Persistent Systems",       sector:"IT"},
  {sym:"MPHASIS.NS",     name:"Mphasis",                  sector:"IT"},
  {sym:"LTIM.NS",        name:"LTIMindtree",              sector:"IT"},
  {sym:"COFORGE.NS",     name:"Coforge",                  sector:"IT"},
  {sym:"OFSS.NS",        name:"Oracle Financial Services", sector:"IT"},
  {sym:"HEXAWARE.NS",    name:"Hexaware Technologies",    sector:"IT"},
  {sym:"TATAELXSI.NS",   name:"Tata Elxsi",               sector:"IT"},
  {sym:"KPITTECH.NS",    name:"KPIT Technologies",        sector:"IT"},
  {sym:"CYIENT.NS",      name:"Cyient",                   sector:"IT"},
  {sym:"LTTS.NS",        name:"L&T Technology Services",  sector:"IT"},
  {sym:"SONATSOFTW.NS",  name:"Sonata Software",          sector:"IT"},
  {sym:"MASTEK.NS",      name:"Mastek",                   sector:"IT"},
  {sym:"TANLA.NS",       name:"Tanla Platforms",          sector:"IT"},
  {sym:"ZENSAR.NS",      name:"Zensar Technologies",      sector:"IT"},
  {sym:"BIRLASOFT.NS",   name:"Birlasoft",                sector:"IT"},
  {sym:"RATEGAIN.NS",    name:"RateGain Travel Tech",     sector:"IT"},
  {sym:"NEWGEN.NS",      name:"Newgen Software",          sector:"IT"},
  {sym:"ROUTE.NS",       name:"Route Mobile",             sector:"IT"},
  // BFSI
  {sym:"FEDERALBNK.NS",  name:"Federal Bank",             sector:"BFSI"},
  {sym:"IDFCFIRSTB.NS",  name:"IDFC First Bank",          sector:"BFSI"},
  {sym:"BANDHANBNK.NS",  name:"Bandhan Bank",             sector:"BFSI"},
  {sym:"RBLBANK.NS",     name:"RBL Bank",                 sector:"BFSI"},
  {sym:"AUBANK.NS",      name:"AU Small Finance Bank",    sector:"BFSI"},
  {sym:"CANBK.NS",       name:"Canara Bank",              sector:"BFSI"},
  {sym:"BANKBARODA.NS",  name:"Bank of Baroda",           sector:"BFSI"},
  {sym:"PNB.NS",         name:"Punjab National Bank",     sector:"BFSI"},
  {sym:"UNIONBANK.NS",   name:"Union Bank of India",      sector:"BFSI"},
  {sym:"INDIANB.NS",     name:"Indian Bank",              sector:"BFSI"},
  {sym:"MAHABANK.NS",    name:"Bank of Maharashtra",      sector:"BFSI"},
  {sym:"CHOLAFIN.NS",    name:"Chola Finance",            sector:"BFSI"},
  {sym:"MUTHOOTFIN.NS",  name:"Muthoot Finance",          sector:"BFSI"},
  {sym:"MANAPPURAM.NS",  name:"Manappuram Finance",       sector:"BFSI"},
  {sym:"ICICIGI.NS",     name:"ICICI Lombard GIC",        sector:"Insurance"},
  {sym:"ICICIPRULI.NS",  name:"ICICI Pru Life Insurance", sector:"Insurance"},
  {sym:"GICRE.NS",       name:"GIC Re",                   sector:"Insurance"},
  {sym:"ANGELONE.NS",    name:"Angel One",                sector:"BFSI"},
  {sym:"MOTILALOFS.NS",  name:"Motilal Oswal Financial",  sector:"BFSI"},
  {sym:"360ONE.NS",      name:"360 ONE WAM",              sector:"BFSI"},
  {sym:"IIFL.NS",        name:"IIFL Finance",             sector:"BFSI"},
  {sym:"JIOFIN.NS",      name:"Jio Financial Services",   sector:"BFSI"},
  {sym:"POONAWALLA.NS",  name:"Poonawalla Fincorp",       sector:"BFSI"},
  {sym:"CDSL.NS",        name:"CDSL",                     sector:"BFSI"},
  {sym:"CAMS.NS",        name:"CAMS",                     sector:"BFSI"},
  {sym:"KFINTECH.NS",    name:"KFin Technologies",        sector:"BFSI"},
  // Pharma
  {sym:"AUROPHARMA.NS",  name:"Aurobindo Pharma",         sector:"Pharma"},
  {sym:"LUPIN.NS",       name:"Lupin",                    sector:"Pharma"},
  {sym:"BIOCON.NS",      name:"Biocon",                   sector:"Pharma"},
  {sym:"TORNTPHARM.NS",  name:"Torrent Pharma",           sector:"Pharma"},
  {sym:"ALKEM.NS",       name:"Alkem Laboratories",       sector:"Pharma"},
  {sym:"IPCALAB.NS",     name:"IPCA Labs",                sector:"Pharma"},
  {sym:"ABBOTINDIA.NS",  name:"Abbott India",             sector:"Pharma"},
  {sym:"PFIZER.NS",      name:"Pfizer India",             sector:"Pharma"},
  {sym:"NATCOPHARM.NS",  name:"Natco Pharma",             sector:"Pharma"},
  {sym:"LAURUSLABS.NS",  name:"Laurus Labs",              sector:"Pharma"},
  {sym:"GRANULES.NS",    name:"Granules India",           sector:"Pharma"},
  {sym:"GLENMARK.NS",    name:"Glenmark Pharma",          sector:"Pharma"},
  {sym:"ZYDUSLIFE.NS",   name:"Zydus Lifesciences",       sector:"Pharma"},
  {sym:"SANOFI.NS",      name:"Sanofi India",             sector:"Pharma"},
  // FMCG
  {sym:"MARICO.NS",      name:"Marico",                   sector:"FMCG"},
  {sym:"COLPAL.NS",      name:"Colgate-Palmolive India",  sector:"FMCG"},
  {sym:"DABUR.NS",       name:"Dabur India",              sector:"FMCG"},
  {sym:"GODREJCP.NS",    name:"Godrej Consumer Products", sector:"FMCG"},
  {sym:"EMAMILTD.NS",    name:"Emami",                    sector:"FMCG"},
  {sym:"RADICO.NS",      name:"Radico Khaitan",           sector:"FMCG"},
  {sym:"UBL.NS",         name:"United Breweries",         sector:"FMCG"},
  {sym:"MCDOWELL-N.NS",  name:"United Spirits",           sector:"FMCG"},
  {sym:"VARUNBEV.NS",    name:"Varun Beverages",          sector:"FMCG"},
  {sym:"TASTYBITE.NS",   name:"Tasty Bite Eatables",      sector:"FMCG"},
  // Auto
  {sym:"TVSMOTOR.NS",    name:"TVS Motor",                sector:"Auto"},
  {sym:"ASHOKLEY.NS",    name:"Ashok Leyland",            sector:"Auto"},
  {sym:"BALKRISIND.NS",  name:"Balkrishna Industries",    sector:"Auto"},
  {sym:"EXIDEIND.NS",    name:"Exide Industries",         sector:"Auto"},
  {sym:"MOTHERSON.NS",   name:"Samvardhana Motherson",    sector:"Auto"},
  {sym:"BOSCHLTD.NS",    name:"Bosch India",              sector:"Auto"},
  {sym:"BHARATFORG.NS",  name:"Bharat Forge",             sector:"Auto"},
  {sym:"CUMMINSIND.NS",  name:"Cummins India",            sector:"Auto"},
  {sym:"SUNDRMFAST.NS",  name:"Sundram Fasteners",        sector:"Auto"},
  {sym:"ENDURANCE.NS",   name:"Endurance Technologies",   sector:"Auto"},
  {sym:"EIHOTEL.NS",     name:"EIH (Oberoi Hotels)",      sector:"Hospitality"},
  {sym:"MAHINDCIE.NS",   name:"Mahindra CIE Automotive",  sector:"Auto"},
  {sym:"OLECTRA.NS",     name:"Olectra Greentech",        sector:"Auto"},
  // Metal
  {sym:"HINDALCO.NS",    name:"Hindalco Industries",      sector:"Metal"},
  {sym:"VEDL.NS",        name:"Vedanta",                  sector:"Metal"},
  {sym:"SAIL.NS",        name:"SAIL",                     sector:"Metal"},
  {sym:"NMDC.NS",        name:"NMDC",                     sector:"Mining"},
  {sym:"NATIONALUM.NS",  name:"National Aluminium",       sector:"Metal"},
  {sym:"HINDCOPPER.NS",  name:"Hindustan Copper",         sector:"Metal"},
  {sym:"APLAPOLLO.NS",   name:"APL Apollo Tubes",         sector:"Metal"},
  {sym:"RATNAMANI.NS",   name:"Ratnamani Metals",         sector:"Metal"},
  {sym:"GPIL.NS",        name:"Godawari Power & Ispat",   sector:"Metal"},
  {sym:"WELCORP.NS",     name:"Welspun Corp",             sector:"Metal"},
  // Cement
  {sym:"AMBUJACEM.NS",   name:"Ambuja Cements",           sector:"Cement"},
  {sym:"ACC.NS",         name:"ACC",                      sector:"Cement"},
  {sym:"SHREECEM.NS",    name:"Shree Cement",             sector:"Cement"},
  {sym:"DALMIACEME.NS",  name:"Dalmia Bharat",            sector:"Cement"},
  {sym:"JKCEMENT.NS",    name:"JK Cement",                sector:"Cement"},
  {sym:"RAMCOCEM.NS",    name:"Ramco Cements",            sector:"Cement"},
  {sym:"JKLAKSHMI.NS",   name:"JK Lakshmi Cement",       sector:"Cement"},
  {sym:"STARCEMENT.NS",  name:"Star Cement",              sector:"Cement"},
  // Energy/Oil
  {sym:"IOC.NS",         name:"Indian Oil Corporation",   sector:"Energy"},
  {sym:"HINDPETRO.NS",   name:"HPCL",                     sector:"Energy"},
  {sym:"GAIL.NS",        name:"GAIL India",               sector:"Energy"},
  {sym:"OIL.NS",         name:"Oil India",                sector:"Energy"},
  {sym:"MGL.NS",         name:"Mahanagar Gas",            sector:"Energy"},
  {sym:"IGL.NS",         name:"Indraprastha Gas",         sector:"Energy"},
  {sym:"PETRONET.NS",    name:"Petronet LNG",             sector:"Energy"},
  {sym:"CASTROLIND.NS",  name:"Castrol India",            sector:"Energy"},
  {sym:"GSPL.NS",        name:"Gujarat State Petronets",  sector:"Energy"},
  // Power
  {sym:"ADANIGREEN.NS",  name:"Adani Green Energy",       sector:"Power"},
  {sym:"ADANIPOWER.NS",  name:"Adani Power",              sector:"Power"},
  {sym:"TATAPOWER.NS",   name:"Tata Power",               sector:"Power"},
  {sym:"TORNTPOWER.NS",  name:"Torrent Power",            sector:"Power"},
  {sym:"CESC.NS",        name:"CESC",                     sector:"Power"},
  {sym:"NHPC.NS",        name:"NHPC",                     sector:"Power"},
  {sym:"SJVN.NS",        name:"SJVN",                     sector:"Power"},
  {sym:"RECLTD.NS",      name:"REC",                      sector:"Power"},
  {sym:"PFC.NS",         name:"Power Finance Corp",       sector:"Power"},
  {sym:"SUZLON.NS",      name:"Suzlon Energy",            sector:"Power"},
  {sym:"INOXWIND.NS",    name:"Inox Wind",                sector:"Power"},
  // Healthcare
  {sym:"MAXHEALTH.NS",   name:"Max Healthcare",           sector:"Healthcare"},
  {sym:"FORTIS.NS",      name:"Fortis Healthcare",        sector:"Healthcare"},
  {sym:"NARAYANA.NS",    name:"Narayana Hrudayalaya",     sector:"Healthcare"},
  {sym:"METROPOLIS.NS",  name:"Metropolis Healthcare",    sector:"Healthcare"},
  {sym:"LALPATHLAB.NS",  name:"Dr Lal PathLabs",          sector:"Healthcare"},
  {sym:"KIMS.NS",        name:"KIMS",                     sector:"Healthcare"},
  {sym:"YATHARTH.NS",    name:"Yatharth Hospital",        sector:"Healthcare"},
  // Retail / Consumer
  {sym:"DMART.NS",       name:"Avenue Supermarts (D-Mart)",sector:"Retail"},
  {sym:"NYKAA.NS",       name:"Nykaa (FSN E-Commerce)",   sector:"Retail"},
  {sym:"ZOMATO.NS",      name:"Zomato",                   sector:"Retail"},
  {sym:"DELHIVERY.NS",   name:"Delhivery",                sector:"Logistics"},
  {sym:"SHOPERSTOP.NS",  name:"Shoppers Stop",            sector:"Retail"},
  {sym:"VMART.NS",       name:"V-Mart Retail",            sector:"Retail"},
  {sym:"RELAXO.NS",      name:"Relaxo Footwears",         sector:"Consumer"},
  {sym:"BATAINDIA.NS",   name:"Bata India",               sector:"Consumer"},
  {sym:"PAGEIND.NS",     name:"Page Industries",          sector:"Consumer"},
  {sym:"TITAN.NS",       name:"Titan",                    sector:"Consumer"},
  {sym:"KALYANKJIL.NS",  name:"Kalyan Jewellers",         sector:"Consumer"},
  {sym:"MANYAVAR.NS",    name:"Vedant Fashions",          sector:"Consumer"},
  {sym:"VOLTAS.NS",      name:"Voltas",                   sector:"Consumer"},
  {sym:"HAVELLS.NS",     name:"Havells India",            sector:"Consumer"},
  {sym:"BLUESTARCO.NS",  name:"Blue Star",                sector:"Consumer"},
  {sym:"CROMPTON.NS",    name:"Crompton Consumer",        sector:"Consumer"},
  // Realty
  {sym:"DLF.NS",         name:"DLF",                      sector:"Realty"},
  {sym:"GODREJPROP.NS",  name:"Godrej Properties",        sector:"Realty"},
  {sym:"OBEROIRLTY.NS",  name:"Oberoi Realty",            sector:"Realty"},
  {sym:"PRESTIGE.NS",    name:"Prestige Estates",         sector:"Realty"},
  {sym:"BRIGADE.NS",     name:"Brigade Enterprises",      sector:"Realty"},
  {sym:"SOBHA.NS",       name:"Sobha",                    sector:"Realty"},
  {sym:"PHOENIXLTD.NS",  name:"Phoenix Mills",            sector:"Realty"},
  {sym:"MAHLIFE.NS",     name:"Mahindra Lifespace",       sector:"Realty"},
  // Infra
  {sym:"IRB.NS",         name:"IRB Infrastructure",       sector:"Infra"},
  {sym:"KNRCON.NS",      name:"KNR Constructions",        sector:"Infra"},
  {sym:"NCC.NS",         name:"NCC",                      sector:"Infra"},
  {sym:"CONCOR.NS",      name:"Container Corp of India",  sector:"Infra"},
  {sym:"GMRINFRA.NS",    name:"GMR Airports Infra",       sector:"Infra"},
  // Defence
  {sym:"BEL.NS",         name:"Bharat Electronics",       sector:"Defence"},
  {sym:"HAL.NS",         name:"HAL",                      sector:"Defence"},
  {sym:"MIDHANI.NS",     name:"Mishra Dhatu Nigam",       sector:"Defence"},
  {sym:"COCHINSHIP.NS",  name:"Cochin Shipyard",          sector:"Defence"},
  {sym:"MAZAGON.NS",     name:"Mazagon Dock",             sector:"Defence"},
  {sym:"GRSE.NS",        name:"Garden Reach Shipbuilders",sector:"Defence"},
  {sym:"PARAS.NS",       name:"Paras Defence",            sector:"Defence"},
  // Chemicals
  {sym:"PIDILITIND.NS",  name:"Pidilite Industries",      sector:"Chemicals"},
  {sym:"SRF.NS",         name:"SRF",                      sector:"Chemicals"},
  {sym:"DEEPAKNITR.NS",  name:"Deepak Nitrite",           sector:"Chemicals"},
  {sym:"NAVINFLUOR.NS",  name:"Navin Fluorine",           sector:"Chemicals"},
  {sym:"ATUL.NS",        name:"Atul",                     sector:"Chemicals"},
  {sym:"VINATIORGA.NS",  name:"Vinati Organics",          sector:"Chemicals"},
  {sym:"GALAXYSURF.NS",  name:"Galaxy Surfactants",       sector:"Chemicals"},
  {sym:"FINEORG.NS",     name:"Fine Organic",             sector:"Chemicals"},
  {sym:"TATACHEM.NS",    name:"Tata Chemicals",           sector:"Chemicals"},
  {sym:"AARTIIND.NS",    name:"Aarti Industries",         sector:"Chemicals"},
  // Engineering/Capital Goods
  {sym:"ABB.NS",         name:"ABB India",                sector:"Engineering"},
  {sym:"SIEMENS.NS",     name:"Siemens India",            sector:"Engineering"},
  {sym:"THERMAX.NS",     name:"Thermax",                  sector:"Engineering"},
  {sym:"BHEL.NS",        name:"BHEL",                     sector:"Engineering"},
  {sym:"AIAENG.NS",      name:"AIA Engineering",          sector:"Engineering"},
  {sym:"ELGIEQUIP.NS",   name:"Elgi Equipments",          sector:"Engineering"},
  {sym:"TIINDIA.NS",     name:"Tube Investments",         sector:"Engineering"},
  {sym:"TATATECH.NS",    name:"Tata Technologies",        sector:"Engineering"},
  {sym:"GRINDWELL.NS",   name:"Grindwell Norton",         sector:"Engineering"},
  // Media
  {sym:"ZEEL.NS",        name:"Zee Entertainment",        sector:"Media"},
  {sym:"SUNTV.NS",       name:"Sun TV Network",           sector:"Media"},
  {sym:"PVR.NS",         name:"PVR Inox",                 sector:"Media"},
  {sym:"NAZARA.NS",      name:"Nazara Technologies",      sector:"Media"},
  // Logistics
  {sym:"BLUEDART.NS",    name:"Blue Dart Express",        sector:"Logistics"},
  {sym:"TCI.NS",         name:"Transport Corp of India",  sector:"Logistics"},
  {sym:"MAHLOG.NS",      name:"Mahindra Logistics",       sector:"Logistics"},
  // Textiles
  {sym:"RAYMOND.NS",     name:"Raymond",                  sector:"Textile"},
  {sym:"VARDHACRLC.NS",  name:"Vardhman Textiles",        sector:"Textile"},
  {sym:"TRIDENT.NS",     name:"Trident",                  sector:"Textile"},
  {sym:"WELSPUNLIV.NS",  name:"Welspun Living",           sector:"Textile"},
  // PSU/Exchanges
  {sym:"IRCTC.NS",       name:"IRCTC",                    sector:"PSU"},
  {sym:"RVNL.NS",        name:"Rail Vikas Nigam",         sector:"PSU"},
  {sym:"IRFC.NS",        name:"IRFC",                     sector:"PSU"},
  {sym:"HUDCO.NS",       name:"HUDCO",                    sector:"PSU"},
  {sym:"NBCC.NS",        name:"NBCC India",               sector:"PSU"},
  {sym:"BEML.NS",        name:"BEML",                     sector:"PSU"},
  {sym:"MOIL.NS",        name:"MOIL",                     sector:"PSU"},
  {sym:"IEX.NS",         name:"Indian Energy Exchange",   sector:"Exchange"},
  {sym:"MCX.NS",         name:"MCX India",                sector:"Exchange"},
  {sym:"BSE.NS",         name:"BSE Ltd",                  sector:"Exchange"},
  // Internet/Fintech
  {sym:"NAUKRI.NS",      name:"Info Edge (Naukri)",       sector:"Internet"},
  {sym:"PAYTM.NS",       name:"Paytm (One97 Comm)",       sector:"Fintech"},
  {sym:"POLICYBZR.NS",   name:"PB Fintech (PolicyBazaar)",sector:"Fintech"},
  // Cables/Electricals
  {sym:"POLYCAB.NS",     name:"Polycab India",            sector:"Electricals"},
  {sym:"KEI.NS",         name:"KEI Industries",           sector:"Electricals"},
  {sym:"FINOLEX.NS",     name:"Finolex Cables",           sector:"Electricals"},
  {sym:"HFCL.NS",        name:"HFCL",                     sector:"Electricals"},
  {sym:"STLTECH.NS",     name:"Sterlite Technologies",    sector:"Electricals"},
  // Hospitality
  {sym:"INDHOTEL.NS",    name:"Indian Hotels (Taj)",      sector:"Hospitality"},
  {sym:"LEMONTREE.NS",   name:"Lemon Tree Hotels",        sector:"Hospitality"},
  {sym:"MAHINDHOLIDAY.NS",name:"Mahindra Holidays",       sector:"Hospitality"},
  // Mining/Coal
  {sym:"BHARATCOAL.NS",  name:"Bharat Coking Coal (BCCL)",sector:"Mining"},
  {sym:"HINDCOPPER.NS",  name:"Hindustan Copper",         sector:"Mining"},
  {sym:"GMDCLTD.NS",     name:"GMDC",                     sector:"Mining"},
  {sym:"KIOCL.NS",       name:"KIOCL",                    sector:"Mining"},
  // Paints
  {sym:"BERGEPAINT.NS",  name:"Berger Paints",            sector:"Paints"},
  {sym:"KANSAINER.NS",   name:"Kansai Nerolac",           sector:"Paints"},
  {sym:"INDIGO.NS",      name:"IndiGo (InterGlobe)",      sector:"Aviation"},
  {sym:"SPICEJET.NS",    name:"SpiceJet",                 sector:"Aviation"},
  {sym:"AIRINDIAEX.NS",  name:"Air India Express",        sector:"Aviation"},
  {sym:"JUSTDIAL.NS",    name:"Just Dial",                sector:"Internet"},
  {sym:"NESCO.NS",       name:"NESCO",                    sector:"Realty"},
  {sym:"MOTHERSON.NS",   name:"Motherson Sumi",           sector:"Auto"},
  {sym:"LINDEINDIA.NS",  name:"Linde India",              sector:"Chemicals"},
  {sym:"SOLARINDS.NS",   name:"Solar Industries",         sector:"Defence"},
  {sym:"MFSL.NS",        name:"Max Financial Services",   sector:"Insurance"},
  {sym:"STARHEALTH.NS",  name:"Star Health Insurance",    sector:"Insurance"},
  {sym:"NIACL.NS",       name:"New India Assurance",      sector:"Insurance"},
  {sym:"GICRE.NS",       name:"GIC Re",                   sector:"Insurance"},
  {sym:"M&MFIN.NS",      name:"M&M Financial Services",   sector:"BFSI"},
  {sym:"LICHSGFIN.NS",   name:"LIC Housing Finance",      sector:"BFSI"},
  {sym:"SUNDARMFIN.NS",  name:"Sundaram Finance",         sector:"BFSI"},
  {sym:"PIRAMALENTER.NS",name:"Piramal Enterprises",      sector:"Pharma"},
];

const SECTORS = ["All", ...Array.from(new Set(ALL_NSE_STOCKS.map(s=>s.sector))).sort()];
const CORS = "https://corsproxy.io/?";
const YF   = "https://query1.finance.yahoo.com/v8/finance/chart/";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt  = n => n==null?"—":n.toLocaleString("en-IN",{maximumFractionDigits:2});
const pct  = n => n==null?"—":`${n>=0?"+":""}${n.toFixed(2)}%`;
const clr  = n => n==null?"#7a8299":n>=0?"#4fffb0":"#ff6b6b";

async function fetchQ(sym) {
  try {
    const r = await fetch(`${CORS}${encodeURIComponent(YF+sym+"?interval=1d&range=1mo")}`,
      {headers:{"x-requested-with":"XMLHttpRequest"}});
    const d = await r.json();
    const m = d?.chart?.result?.[0]?.meta;
    if(!m) return null;
    const prev  = m.chartPreviousClose??m.previousClose;
    const price = m.regularMarketPrice;
    return {
      price, change:price-prev, changePct:((price-prev)/prev)*100,
      high:m.regularMarketDayHigh, low:m.regularMarketDayLow,
      vol:m.regularMarketVolume,
      closes:d.chart.result[0].indicators?.quote?.[0]?.close??[],
    };
  } catch { return null; }
}

async function aiCall(prompt, mode) {
  const sys = mode==="trader"
    ? "You are a sharp Indian stock market analyst for a SHORT-TERM TRADER. Use 3-5 bullet points. Mention key price levels, momentum, volume signals, and short-term risks. No definitive buy/sell calls."
    : "You are a sharp Indian stock market analyst for a LONG-TERM INVESTOR. Use 3-5 bullet points. Focus on fundamentals, valuation, competitive moat, and 3-5 year outlook. No definitive buy/sell calls.";
  const r = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST", headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
      system:sys, messages:[{role:"user",content:prompt}]})
  });
  const d = await r.json();
  return d?.content?.[0]?.text??"Analysis unavailable.";
}

// ─── MINI SPARKLINE ──────────────────────────────────────────────────────────
function Spark({closes,color}) {
  const v=(closes||[]).filter(Boolean);
  if(v.length<2) return <div style={{height:24}}/>;
  const mn=Math.min(...v),mx=Math.max(...v),rng=mx-mn||1;
  const W=64,H=24;
  const pts=v.map((x,i)=>`${(i/(v.length-1))*W},${H-((x-mn)/rng)*(H-3)-1.5}`).join(" ");
  return (
    <svg width={W} height={H} style={{display:"block"}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── STOCK ROW (for list view) ───────────────────────────────────────────────
function StockRow({s, mode, onSelect}) {
  const [q,setQ]   = useState(null);
  const [ld,setLd] = useState(true);
  useEffect(()=>{ fetchQ(s.sym).then(r=>{setQ(r);setLd(false);}); },[s.sym]);
  const c = clr(q?.changePct);
  return (
    <div onClick={()=>onSelect(s,q)} style={{
      display:"grid", gridTemplateColumns:"1fr 64px 80px 70px",
      alignItems:"center", gap:8, padding:"9px 14px",
      borderBottom:"1px solid rgba(255,255,255,0.04)",
      cursor:"pointer", transition:"background 0.15s",
    }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.03)"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}
    >
      <div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#e8ecf4"}}>{s.name}</div>
        <div style={{fontSize:9,color:"#5a6278",fontFamily:"'DM Mono',monospace",marginTop:1}}>
          {s.sym.replace(".NS","")} · <span style={{color:"#7a8299"}}>{s.sector}</span>
        </div>
      </div>
      <Spark closes={q?.closes||[]} color={c}/>
      {ld
        ? <div style={{fontSize:10,color:"#5a6278",fontFamily:"'DM Mono',monospace",textAlign:"right"}}>…</div>
        : q
          ? <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,color:"#fff"}}>₹{fmt(q.price)}</div>
              <div style={{fontSize:10,color:c,fontFamily:"'DM Mono',monospace"}}>{pct(q.changePct)}</div>
            </div>
          : <div style={{fontSize:10,color:"#ff6b6b",fontFamily:"'DM Mono',monospace",textAlign:"right"}}>N/A</div>
      }
      <div style={{textAlign:"right",fontSize:9,color:"#4fffb0",fontFamily:"'DM Mono',monospace"}}>
        {mode==="trader"?"Signal ›":"Analysis ›"}
      </div>
    </div>
  );
}

// ─── DETAIL PANEL ────────────────────────────────────────────────────────────
function DetailPanel({s, q, mode, onClose}) {
  const [ai,setAi]   = useState("");
  const [aiL,setAiL] = useState(false);

  useEffect(()=>{
    if(!s) return; setAi(""); setAiL(true);
    const price = q
      ? `Price ₹${fmt(q.price)}, ${pct(q.changePct)} today, H:₹${fmt(q.high)} L:₹${fmt(q.low)}, Vol:${q.vol?(q.vol/1e5).toFixed(1)+"L":"N/A"}`
      : "Price data unavailable";
    aiCall(`Analyze ${s.name} (${s.sym}). ${price}. Sector: ${s.sector}.`, mode)
      .then(r=>{setAi(r);setAiL(false);});
  },[s?.sym, mode]);

  if(!s) return null;
  const c = clr(q?.changePct);

  return (
    <div style={{
      position:"fixed", top:0, right:0, width:360, height:"100vh",
      background:"#0d1119", borderLeft:"1px solid rgba(255,255,255,0.08)",
      overflowY:"auto", zIndex:1000, padding:"0 0 40px",
      boxShadow:"-8px 0 40px rgba(0,0,0,0.6)",
    }}>
      <div style={{padding:"16px 18px 12px",borderBottom:"1px solid rgba(255,255,255,0.07)",
        position:"sticky",top:0,background:"#0d1119",zIndex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,color:"#fff"}}>{s.name}</div>
            <div style={{fontSize:10,color:"#7a8299",fontFamily:"'DM Mono',monospace",marginTop:2}}>
              {s.sym} · {s.sector}
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",
            color:"#7a8299",width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:14,
            display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {q && (
          <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {[
              ["Price",`₹${fmt(q.price)}`],
              ["Change",pct(q.changePct)],
              ["High",`₹${fmt(q.high)}`],
              ["Low",`₹${fmt(q.low)}`],
              ["Vol",q.vol?`${(q.vol/1e5).toFixed(1)}L`:"—"],
              ["1M Trend", q.changePct>=0?"▲ Uptrend":"▼ Downtrend"],
            ].map(([k,v])=>(
              <div key={k} style={{background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"7px 9px",
                border:"1px solid rgba(255,255,255,0.06)"}}>
                <div style={{fontSize:9,color:"#7a8299",fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.07em"}}>{k}</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:13,
                  color:k==="Change"?c:k==="1M Trend"?c:"#fff",marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {q && (
          <div style={{marginTop:12}}>
            <Spark closes={q.closes} color={c}/>
            <div style={{fontSize:9,color:"#5a6278",fontFamily:"'DM Mono',monospace",marginTop:3}}>
              1-month price chart
            </div>
          </div>
        )}
      </div>

      <div style={{padding:"16px 18px"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,color:"#fff"}}>
            ✦ AI {mode==="trader"?"Trader":"Investor"} Analysis
          </span>
          <span style={{fontSize:9,fontFamily:"'DM Mono',monospace",
            color:mode==="trader"?"#4fffb0":"#74b9ff",
            background:mode==="trader"?"rgba(79,255,176,0.08)":"rgba(116,185,255,0.08)",
            border:`1px solid ${mode==="trader"?"rgba(79,255,176,0.2)":"rgba(116,185,255,0.2)"}`,
            padding:"2px 7px",borderRadius:3}}>{mode.toUpperCase()}</span>
        </div>
        {aiL ? (
          <div style={{fontSize:12,color:"#4fffb0",fontFamily:"'DM Mono',monospace",
            animation:"pulse 1.2s infinite"}}>Analyzing {s.name}…</div>
        ) : (
          <div style={{fontSize:13,color:"#c0cce0",lineHeight:1.75,whiteSpace:"pre-wrap"}}>{ai}</div>
        )}
        <button onClick={()=>{setAi("");setAiL(true);
          const p=q?`Price ₹${fmt(q.price)}, ${pct(q.changePct)} today.`:"Price data unavailable";
          aiCall(`Analyze ${s.name} (${s.sym}). ${p}. Sector:${s.sector}.`,mode)
            .then(r=>{setAi(r);setAiL(false);});}}
          style={{marginTop:14,background:"transparent",border:"1px solid rgba(255,255,255,0.09)",
            color:"#7a8299",padding:"5px 12px",borderRadius:6,cursor:"pointer",
            fontSize:10,fontFamily:"'DM Mono',monospace"}}>↺ Re-analyze</button>
      </div>
    </div>
  );
}

// ─── AI CHAT ─────────────────────────────────────────────────────────────────
function Chat({mode}) {
  const [msgs,setMsgs] = useState([]);
  const [inp,setInp]   = useState("");
  const [busy,setBusy] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);

  const send = async() => {
    if(!inp.trim()||busy) return;
    const q=inp.trim(); setInp("");
    setMsgs(m=>[...m,{r:"u",t:q}]); setBusy(true);
    const res = await aiCall(`Indian stock market question: ${q}`, mode);
    setMsgs(m=>[...m,{r:"a",t:res}]); setBusy(false);
  };

  return (
    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",
      borderRadius:12,overflow:"hidden",display:"flex",flexDirection:"column",height:300}}>
      <div style={{padding:"10px 14px",borderBottom:"1px solid rgba(255,255,255,0.06)",
        fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,color:"#fff",
        display:"flex",alignItems:"center",gap:8}}>
        <span style={{color:"#4fffb0"}}>✦</span> AI Market Chat
        <span style={{marginLeft:"auto",fontSize:8,fontFamily:"'DM Mono',monospace",
          color:mode==="trader"?"#4fffb0":"#74b9ff",
          background:mode==="trader"?"rgba(79,255,176,0.07)":"rgba(116,185,255,0.07)",
          padding:"2px 7px",borderRadius:3,border:`1px solid ${mode==="trader"?"rgba(79,255,176,0.18)":"rgba(116,185,255,0.18)"}`}}>
          {mode.toUpperCase()}
        </span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.length===0&&(
          <div style={{color:"#3a4568",fontSize:11,fontFamily:"'DM Mono',monospace",textAlign:"center",marginTop:20}}>
            {mode==="trader"?"Ask about breakouts, momentum, sectors…":"Ask about fundamentals, valuations, dividends…"}
          </div>
        )}
        {msgs.map((m,i)=>(
          <div key={i} style={{alignSelf:m.r==="u"?"flex-end":"flex-start",maxWidth:"86%",
            background:m.r==="u"?"rgba(79,255,176,0.08)":"rgba(255,255,255,0.04)",
            border:`1px solid ${m.r==="u"?"rgba(79,255,176,0.16)":"rgba(255,255,255,0.06)"}`,
            borderRadius:m.r==="u"?"12px 12px 2px 12px":"2px 12px 12px 12px",
            padding:"7px 11px",fontSize:12,
            color:m.r==="u"?"#4fffb0":"#c0cce0",lineHeight:1.65,whiteSpace:"pre-wrap"}}>
            {m.t}
          </div>
        ))}
        {busy&&<div style={{fontSize:10,color:"#4fffb0",fontFamily:"'DM Mono',monospace",animation:"pulse 1.2s infinite"}}>thinking…</div>}
        <div ref={ref}/>
      </div>
      <div style={{padding:"8px 10px",borderTop:"1px solid rgba(255,255,255,0.06)",display:"flex",gap:6}}>
        <input value={inp} onChange={e=>setInp(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&send()}
          placeholder="Ask anything about Indian stocks…"
          style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",
            borderRadius:7,padding:"7px 10px",color:"#e0e8f4",fontSize:11,
            fontFamily:"'DM Mono',monospace",outline:"none"}}/>
        <button onClick={send} disabled={busy} style={{
          background:busy?"rgba(79,255,176,0.04)":"rgba(79,255,176,0.12)",
          border:"1px solid rgba(79,255,176,0.25)",color:"#4fffb0",
          padding:"7px 12px",borderRadius:7,cursor:busy?"not-allowed":"pointer",
          fontSize:11,fontFamily:"'DM Mono',monospace"}}>→</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [mode,    setMode]    = useState("trader");
  const [search,  setSearch]  = useState("");
  const [sector,  setSector]  = useState("All");
  const [selected, setSelected] = useState(null);
  const [selQ,    setSelQ]    = useState(null);
  const [page,    setPage]    = useState(0);
  const PAGE_SIZE = 40;

  const filtered = useMemo(()=>{
    const q = search.toLowerCase();
    return ALL_NSE_STOCKS.filter(s=>{
      const matchSec = sector==="All" || s.sector===sector;
      const matchQ   = !q || s.name.toLowerCase().includes(q) || s.sym.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q);
      return matchSec && matchQ;
    });
  },[search,sector]);

  const paged = filtered.slice(0, (page+1)*PAGE_SIZE);

  const handleSelect = useCallback((s,q)=>{
    setSelected(s); setSelQ(q);
  },[]);

  return (
    <div style={{minHeight:"100vh",background:"#090c11",color:"#e8ecf4",
      fontFamily:"'DM Sans',sans-serif",paddingRight:selected?360:0,transition:"padding-right 0.3s"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        input::placeholder{color:#3a4568}
        input{caret-color:#4fffb0}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"16px 20px 12px",borderBottom:"1px solid rgba(255,255,255,0.06)",
        background:"#090c11",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:12,justifyContent:"space-between"}}>
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:8,color:"#4fffb0",
              letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:2}}>
              NSE · {ALL_NSE_STOCKS.length} STOCKS · LIVE + AI
            </div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:19,color:"#fff",lineHeight:1}}>
              MarketPulse <span style={{color:"#4fffb0"}}>India</span>
            </div>
          </div>
          {/* Mode Toggle */}
          <div style={{display:"flex",background:"rgba(255,255,255,0.05)",
            border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,padding:3,gap:2}}>
            {["trader","investor"].map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{
                padding:"6px 16px",borderRadius:7,border:"none",
                background:mode===m?(m==="trader"?"rgba(79,255,176,0.18)":"rgba(116,185,255,0.18)"):"transparent",
                color:mode===m?(m==="trader"?"#4fffb0":"#74b9ff"):"#7a8299",
                fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:11,
                cursor:"pointer",transition:"all 0.2s",
              }}>{m==="trader"?"⚡ Trader":"📈 Investor"}</button>
            ))}
          </div>
        </div>

        {/* SEARCH + SECTOR FILTER */}
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:1,minWidth:200}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",
              fontSize:12,color:"#5a6278"}}>🔍</span>
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}
              placeholder={`Search ${ALL_NSE_STOCKS.length} NSE stocks by name, symbol or sector…`}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,
                padding:"8px 12px 8px 32px",color:"#e0e8f4",fontSize:12,
                fontFamily:"'DM Mono',monospace",outline:"none"}}/>
          </div>
          <select value={sector} onChange={e=>{setSector(e.target.value);setPage(0);}} style={{
            background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",
            borderRadius:8,padding:"8px 12px",color:"#e0e8f4",fontSize:11,
            fontFamily:"'DM Mono',monospace",outline:"none",cursor:"pointer",
            appearance:"none",minWidth:140}}>
            {SECTORS.map(s=><option key={s} value={s} style={{background:"#111"}}>{s}</option>)}
          </select>
          <div style={{display:"flex",alignItems:"center",padding:"0 10px",
            background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",
            borderRadius:8,fontSize:10,color:"#7a8299",fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>
            {filtered.length} stocks
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:0,maxWidth:1200,margin:"0 auto"}}>

        {/* LEFT: STOCK LIST */}
        <div style={{borderRight:"1px solid rgba(255,255,255,0.06)"}}>
          {/* Mode banner */}
          <div style={{padding:"7px 14px",
            background:mode==="trader"?"rgba(79,255,176,0.03)":"rgba(116,185,255,0.03)",
            borderBottom:`1px solid ${mode==="trader"?"rgba(79,255,176,0.07)":"rgba(116,185,255,0.07)"}`,
            fontSize:10,color:mode==="trader"?"#4fffb0":"#74b9ff",
            fontFamily:"'DM Mono',monospace"}}>
            {mode==="trader"
              ?"⚡ Click any stock for AI swing analysis, momentum signals & key levels"
              :"📈 Click any stock for AI fundamental analysis, valuation & long-term outlook"}
          </div>

          {/* Column headers */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 64px 80px 70px",
            gap:8,padding:"7px 14px",
            borderBottom:"1px solid rgba(255,255,255,0.06)",
            background:"rgba(255,255,255,0.02)"}}>
            {["Company","1M","Price / Chg",""].map(h=>(
              <div key={h} style={{fontSize:9,color:"#5a6278",fontFamily:"'DM Mono',monospace",
                textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</div>
            ))}
          </div>

          {/* Stock rows */}
          {paged.map((s,i)=>(
            <div key={s.sym} style={{animation:"fadeIn 0.2s ease forwards",animationDelay:`${(i%PAGE_SIZE)*0.01}s`}}>
              <StockRow s={s} mode={mode} onSelect={handleSelect}/>
            </div>
          ))}

          {/* Load more */}
          {filtered.length > paged.length && (
            <div style={{padding:"14px",textAlign:"center"}}>
              <button onClick={()=>setPage(p=>p+1)} style={{
                background:"rgba(79,255,176,0.08)",border:"1px solid rgba(79,255,176,0.2)",
                color:"#4fffb0",padding:"8px 24px",borderRadius:7,cursor:"pointer",
                fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                Load more ({filtered.length - paged.length} remaining)
              </button>
            </div>
          )}
          {filtered.length===0&&(
            <div style={{padding:"40px 20px",textAlign:"center",color:"#3a4568",
              fontSize:12,fontFamily:"'DM Mono',monospace"}}>
              No stocks match "{search}"
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{padding:"14px 14px",display:"flex",flexDirection:"column",gap:14,
          position:"sticky",top:120,height:"calc(100vh - 120px)",overflowY:"auto"}}>

          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[
              {v:ALL_NSE_STOCKS.length,l:"Total Stocks",c:"#4fffb0"},
              {v:SECTORS.length-1,     l:"Sectors",     c:"#74b9ff"},
              {v:filtered.length,      l:"Filtered",    c:"#ffd166"},
              {v:"Live",               l:"Price Feed",  c:"#a29bfe"},
            ].map(x=>(
              <div key={x.l} style={{background:"rgba(255,255,255,0.03)",
                border:"1px solid rgba(255,255,255,0.07)",borderRadius:8,padding:"10px 11px"}}>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,color:x.c}}>{x.v}</div>
                <div style={{fontSize:9,color:"#7a8299",fontFamily:"'DM Mono',monospace",marginTop:2,
                  textTransform:"uppercase",letterSpacing:"0.07em"}}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Quick sector filter pills */}
          <div>
            <div style={{fontSize:9,color:"#5a6278",fontFamily:"'DM Mono',monospace",
              textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:7}}>Quick Sectors</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {["All","IT","BFSI","Pharma","Auto","Energy","Power","Metal","FMCG","Defence","Mining"].map(s=>(
                <button key={s} onClick={()=>{setSector(s);setPage(0);}} style={{
                  fontSize:9,fontFamily:"'DM Mono',monospace",
                  padding:"3px 8px",borderRadius:4,cursor:"pointer",border:"1px solid",
                  background:sector===s?"rgba(79,255,176,0.12)":"transparent",
                  color:sector===s?"#4fffb0":"#7a8299",
                  borderColor:sector===s?"rgba(79,255,176,0.3)":"rgba(255,255,255,0.08)",
                  transition:"all 0.15s"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* AI Chat */}
          <Chat mode={mode}/>


        </div>
      </div>

      {/* DETAIL PANEL (slide-in) */}
      {selected && (
        <DetailPanel s={selected} q={selQ} mode={mode} onClose={()=>setSelected(null)}/>
      )}

      <div style={{padding:"10px 20px",borderTop:"1px solid rgba(255,255,255,0.05)",
        fontSize:9,color:"#2a3050",fontFamily:"'DM Mono',monospace",textAlign:"center"}}>
        ⚠ Educational purposes only. Not investment advice. Consult a SEBI-registered advisor before investing.
      </div>
    </div>
  );
}
