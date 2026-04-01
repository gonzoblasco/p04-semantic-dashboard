import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const SEED_USER_ID = '00000000-0000-0000-0000-000000000001'

type SeedItem = {
  buyer_nickname: string
  product_title: string
  question_text: string
  category: 'envio' | 'garantia' | 'precio' | 'tecnico' | 'general'
  status: 'pending' | 'resolved' | 'escalated'
}

const ITEMS: SeedItem[] = [
  // --- envio (10) ---
  {
    buyer_nickname: 'carlos_m92',
    product_title: 'Zapatillas Running Asics Gel-Nimbus 25',
    question_text: '¿Hacen envíos a Tucumán? ¿Cuántos días tarda en llegar?',
    category: 'envio',
    status: 'pending',
  },
  {
    buyer_nickname: 'laura_paz',
    product_title: 'Notebook Lenovo IdeaPad 3 15"',
    question_text: 'Estoy en Neuquén capital, ¿el envío tiene costo adicional o es gratis por el monto de compra?',
    category: 'envio',
    status: 'resolved',
  },
  {
    buyer_nickname: 'diego_rv',
    product_title: 'Smart TV Samsung 55" 4K',
    question_text: '¿Pueden coordinar día y horario de entrega? Trabajo todo el día y nadie puede recibir el paquete.',
    category: 'envio',
    status: 'pending',
  },
  {
    buyer_nickname: 'maru_flores',
    product_title: 'Cafetera Nespresso Vertuo Next',
    question_text: '¿Cómo puedo hacer seguimiento del envío una vez que está despachado?',
    category: 'envio',
    status: 'resolved',
  },
  {
    buyer_nickname: 'jorge_k77',
    product_title: 'Silla Gamer RGB con reposapiés',
    question_text: '¿El envío a Mendoza incluye subida a piso? Vivo en un quinto piso sin ascensor.',
    category: 'envio',
    status: 'escalated',
  },
  {
    buyer_nickname: 'patricia_s',
    product_title: 'Heladera No Frost Whirlpool 400L',
    question_text: 'Compré hace 5 días y el número de seguimiento todavía no aparece en el sistema. ¿Qué pasó con mi pedido?',
    category: 'envio',
    status: 'escalated',
  },
  {
    buyer_nickname: 'nico_cordoba',
    product_title: 'Mouse Logitech MX Master 3',
    question_text: '¿Envían a domicilio en Córdoba Capital? ¿O solo a punto de retiro?',
    category: 'envio',
    status: 'pending',
  },
  {
    buyer_nickname: 'sol_vargas',
    product_title: 'Auriculares Sony WH-1000XM5',
    question_text: 'Mi dirección está en zona rural en Entre Ríos. ¿Pueden enviar igual o solo ciudades grandes?',
    category: 'envio',
    status: 'pending',
  },
  {
    buyer_nickname: 'martin_gh',
    product_title: 'Tablet Samsung Galaxy Tab A8',
    question_text: '¿Cuánto tarda el envío express? Necesito el producto para el viernes a más tardar.',
    category: 'envio',
    status: 'resolved',
  },
  {
    buyer_nickname: 'virginia_lp',
    product_title: 'Aspiradora Robot iRobot Roomba i3',
    question_text: 'El tracking dice "en camino" hace tres días. ¿Es normal o hubo algún problema con el envío?',
    category: 'envio',
    status: 'escalated',
  },

  // --- garantia (8) ---
  {
    buyer_nickname: 'roberto_fm',
    product_title: 'Notebook HP Pavilion 15-eh2',
    question_text: '¿Cuántos años de garantía tiene? ¿La garantía es del fabricante o del vendedor?',
    category: 'garantia',
    status: 'pending',
  },
  {
    buyer_nickname: 'clara_ns',
    product_title: 'Lavarropas Electrolux Inverter 9kg',
    question_text: 'Se rompió a los 8 meses de uso. ¿Cómo inicio el reclamo de garantía? ¿Tengo que mandarlo yo o van a buscarlo?',
    category: 'garantia',
    status: 'escalated',
  },
  {
    buyer_nickname: 'pablo_ov',
    product_title: 'iPhone 14 128GB Azul',
    question_text: '¿La garantía cubre daños accidentales como pantalla rota o solo fallas de fábrica?',
    category: 'garantia',
    status: 'pending',
  },
  {
    buyer_nickname: 'daniela_rm',
    product_title: 'Aire Acondicionado Split Inverter 3000W',
    question_text: '¿Dónde queda el service oficial para hacer válida la garantía en Buenos Aires?',
    category: 'garantia',
    status: 'resolved',
  },
  {
    buyer_nickname: 'hernan_bz',
    product_title: 'Impresora Epson EcoTank L3250',
    question_text: '¿Si el producto llega con falla de fábrica puedo cambiarlo directamente o tengo que mandarlo a reparar primero?',
    category: 'garantia',
    status: 'pending',
  },
  {
    buyer_nickname: 'ana_cm',
    product_title: 'Smartwatch Garmin Forerunner 255',
    question_text: '¿La garantía se cae si lo uso para natación aunque dice water-resistant?',
    category: 'garantia',
    status: 'resolved',
  },
  {
    buyer_nickname: 'lucas_pk',
    product_title: 'Procesador AMD Ryzen 5 5600X',
    question_text: '¿El procesador tiene garantía ante fallas por overclocking o eso lo anula?',
    category: 'garantia',
    status: 'pending',
  },
  {
    buyer_nickname: 'valentina_sh',
    product_title: 'Licuadora Oster Pro 1200',
    question_text: 'Compré hace exactamente un año. ¿El periodo de garantía ya venció o hay algunos días de gracia?',
    category: 'garantia',
    status: 'escalated',
  },

  // --- precio (8) ---
  {
    buyer_nickname: 'gustavo_mp',
    product_title: 'Bicicleta Montaña Trek Marlin 5',
    question_text: '¿Tienen precio especial si compro dos unidades para mi y mi hijo?',
    category: 'precio',
    status: 'pending',
  },
  {
    buyer_nickname: 'cecilia_wr',
    product_title: 'Monitor LG 27" QHD IPS 144Hz',
    question_text: '¿Cuántas cuotas sin interés tienen disponibles? Vi que con tarjeta Naranja hay 18 cuotas.',
    category: 'precio',
    status: 'resolved',
  },
  {
    buyer_nickname: 'facundo_al',
    product_title: 'PlayStation 5 Standard Edition',
    question_text: 'El precio cambió desde ayer. ¿Me respetan el precio que vi originalmente si ya lo tenía en el carrito?',
    category: 'precio',
    status: 'escalated',
  },
  {
    buyer_nickname: 'romina_bt',
    product_title: 'Colchón Sommier Piero Doble Pillow 2 Plazas',
    question_text: '¿Hay descuento por pago en efectivo o transferencia bancaria?',
    category: 'precio',
    status: 'pending',
  },
  {
    buyer_nickname: 'esteban_qr',
    product_title: 'Cámara Canon EOS R50 Kit 18-45mm',
    question_text: '¿Puedo negociar el precio? Encontré el mismo producto $8000 más barato en otro vendedor.',
    category: 'precio',
    status: 'pending',
  },
  {
    buyer_nickname: 'noelia_vd',
    product_title: 'Perfume Chanel N°5 EDP 100ml',
    question_text: '¿En el precio ya están incluidos los impuestos nacionales? ¿O se suman al momento de pagar?',
    category: 'precio',
    status: 'resolved',
  },
  {
    buyer_nickname: 'ariel_jc',
    product_title: 'Kit Pesas Hierro Fundido 20kg',
    question_text: '¿Tienen precio mayorista si llevo 5 sets para el gimnasio que estoy armando?',
    category: 'precio',
    status: 'pending',
  },
  {
    buyer_nickname: 'lorena_sz',
    product_title: 'Termotanque Solar Sole Titan 150L',
    question_text: '¿El precio publicado incluye la instalación o eso se cotiza aparte?',
    category: 'precio',
    status: 'resolved',
  },

  // --- tecnico (8) ---
  {
    buyer_nickname: 'damian_fp',
    product_title: 'Placa de Video NVIDIA RTX 4070 Ti',
    question_text: '¿Es compatible con mi motherboard Asus B550-F? Necesito saber si el slot PCIe es compatible.',
    category: 'tecnico',
    status: 'pending',
  },
  {
    buyer_nickname: 'silvia_mb',
    product_title: 'Calefactor Eléctrico Peabody 2000W',
    question_text: '¿Es para 220V? Vivo en Argentina pero quiero llevar uno a Uruguay donde la tensión es diferente.',
    category: 'tecnico',
    status: 'resolved',
  },
  {
    buyer_nickname: 'matias_ez',
    product_title: 'Teclado Mecánico Keychron K6 Pro',
    question_text: '¿Tiene switches hot-swap? Quiero cambiar los switches por Gateron Yellow sin soldar.',
    category: 'tecnico',
    status: 'pending',
  },
  {
    buyer_nickname: 'florencia_hv',
    product_title: 'Batidora KitchenAid Artisan 4.8L',
    question_text: '¿Qué accesorios vienen incluidos en la caja? ¿El gancho para masa, el globo y la paleta están todos?',
    category: 'tecnico',
    status: 'resolved',
  },
  {
    buyer_nickname: 'alejandro_cc',
    product_title: 'Router WiFi 6 TP-Link Archer AX73',
    question_text: '¿Puede funcionar como repetidor de señal o solo como router principal?',
    category: 'tecnico',
    status: 'pending',
  },
  {
    buyer_nickname: 'marina_rl',
    product_title: 'Auriculares Bluetooth JBL Tune 770NC',
    question_text: '¿Cuántas horas de batería tiene con el cancelador de ruido activo versus sin él?',
    category: 'tecnico',
    status: 'pending',
  },
  {
    buyer_nickname: 'sebastian_gf',
    product_title: 'SSD Samsung 970 EVO Plus 1TB M.2',
    question_text: '¿Es compatible con mi notebook que tiene slot M.2 SATA o requiere NVMe? ¿Cómo lo distingo?',
    category: 'tecnico',
    status: 'escalated',
  },
  {
    buyer_nickname: 'andrea_ps',
    product_title: 'Proyector Epson Home Cinema 2350',
    question_text: '¿Cuántos lúmenes tiene? ¿Funciona bien en una habitación con algo de luz natural o necesita oscuridad total?',
    category: 'tecnico',
    status: 'pending',
  },

  // --- general (6) ---
  {
    buyer_nickname: 'tomás_nv',
    product_title: 'Juego de Sábanas Percal 400 Hilos 2 Plazas',
    question_text: '¿Tienen stock del color gris perla? En la publicación figura pero no puedo seleccionarlo.',
    category: 'general',
    status: 'pending',
  },
  {
    buyer_nickname: 'viviana_er',
    product_title: 'Zapatillas Nike Air Max 270',
    question_text: '¿Puedo devolver el producto si no me queda bien el talle? ¿Cuántos días tengo para hacer el cambio?',
    category: 'general',
    status: 'resolved',
  },
  {
    buyer_nickname: 'ignacio_lf',
    product_title: 'Sillón Reclinable 3 Cuerpos Cuero Sintético',
    question_text: '¿Emiten factura A? Soy monotributista y necesito el comprobante para rendir gastos.',
    category: 'general',
    status: 'pending',
  },
  {
    buyer_nickname: 'camila_ot',
    product_title: 'Notebook Lenovo IdeaPad 3 15"',
    question_text: '¿Puedo comprar la notebook y el mouse juntos con un solo envío para ahorrar en el flete?',
    category: 'general',
    status: 'resolved',
  },
  {
    buyer_nickname: 'rodrigo_av',
    product_title: 'Cámara GoPro Hero 12 Black',
    question_text: '¿Tienen algún combo con el accesorio de casco y el flotador? ¿O solo se vende la cámara sola?',
    category: 'general',
    status: 'escalated',
  },
  {
    buyer_nickname: 'claudia_mn',
    product_title: 'Plancha de Pelo Remington Keratin Therapy',
    question_text: '¿Si el producto que recibí no es el que aparece en la foto puedo hacer una denuncia? ¿Cuál es el proceso?',
    category: 'general',
    status: 'escalated',
  },
]

export async function runSeed(): Promise<{ inserted: number; errors: string[] }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }
  if (!openaiKey) {
    throw new Error('Missing OPENAI_API_KEY')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const openai = new OpenAI({ apiKey: openaiKey })

  let inserted = 0
  const errors: string[] = []

  for (let i = 0; i < ITEMS.length; i++) {
    const item = ITEMS[i]
    console.log(`Seeding item ${i + 1}/${ITEMS.length}...`)

    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: item.question_text,
      })
      const embedding = embeddingResponse.data[0].embedding

      const { error } = await supabase.from('support_items').insert({
        user_id: SEED_USER_ID,
        buyer_nickname: item.buyer_nickname,
        product_title: item.product_title,
        question_text: item.question_text,
        category: item.category,
        status: item.status,
        embedding,
      })

      if (error) {
        errors.push(`Item ${i + 1} (${item.buyer_nickname}): ${error.message}`)
      } else {
        inserted++
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      errors.push(`Item ${i + 1} (${item.buyer_nickname}): ${message}`)
    }
  }

  return { inserted, errors }
}
