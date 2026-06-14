/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Post, Story, Notification, Chat, UserProfile } from '../types';

export const CURRENT_USER = {
  name: "Mateo Momoa",
  username: "mat.moa",
  avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80" // Customized curly hair portrait lying down matching your user attachment
};

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: "user",
    name: "Mateo Momoa",
    username: "mat.moa",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80",
    bio: "¡Siempre alegre y con la energía al 100%! ⚡ Vocalista de nuestra banda 'Culto al Shuco' 🎤 (sé que odian el nombre chicos, ¡pero tiene sazón!). Sobreviviente de microfonazos letales ⚡💀",
    role: "Líder & Cantante",
    followers: 1420,
    following: 382
  },
  {
    id: "valeee",
    name: "Valeria",
    username: "valeee.",
    avatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Responsable, ordenada y con mil pendientes en la cabeza. 📋 Administradora de 'Le Rock' 🎸 y mánager oficial de Culto al Shuco. Sin mí, este grupo ya se habría disuelto. ☕💼",
    role: "Mánager & Administradora",
    followers: 934,
    following: 215
  },
  {
    id: "diego",
    name: "Diego",
    username: "Di3g0",
    avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Gracioso, galán y el mejor productor musical que vas a encontrar. 🔥 Coqueto, seguro de mí mismo e integrante de 'Culto al Shuco' (sí, toco la guitarra y odio ese maldito nombre). 😏🎵",
    role: "Productor & Músico",
    followers: 1120,
    following: 540
  },
  {
    id: "sofia",
    name: "Sofía",
    username: "sofi_a",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Lectora empedernida, fan de los vestidos suaves y del color rosa. 🌸 Guitarrista apasionada en 'Culto al Shuco' (por favor Mateo, cambiemos el nombre ya 😪🎸). 📖✨",
    role: "Guitarrista & Lectora",
    followers: 1530,
    following: 610
  },
  {
    id: "lulu",
    name: "Lucía",
    username: "Lu_Lu",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    bio: "Llevo las cuentas de Le Rock (aunque soy un poco distraída, ddaah 💅💸). Súper natural, única y bajista talentosa de Culto al Shuco. No soy pick me, ¡solo soy memorable! 😘🎸",
    role: "Contabilidad & Bajista",
    followers: 820,
    following: 195
  }
];


export const INITIAL_STORIES: Story[] = [];

export const INITIAL_POSTS: Post[] = [
  {
    id: "post_1",
    authorName: "Mateo Momoa",
    authorUsername: "mat.moa",
    authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80",
    content: "¡Hola gente linda! Qué alegría verlos activos. Aquí ensayando a tope en Le Rock para nuestra amada banda 'Culto al Shuco' 🎤🖤 (Yo sé que me odian por el nombre, ¡pero admite que tiene sazón y vibra!). Oigan, recuerden que hoy abrimos Le Rock temprano, ¡así que dejen de quejarse y vénganse hoy!",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=85", // Electric live dynamic band scene
    likes: 1,
    likedByUser: true,
    comments: [
      {
        id: "com_1_1",
        authorName: "Sofía",
        authorUsername: "sofi_a",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        content: "¡Mateo, piedad! Ese nombre es espantoso, de verdad 😭 Aunque el ensayo de hoy estuvo brutal y mi vestido rosa combinó con la guitarra. 🌸🎸",
        createdAt: "Hace 5 minutos"
      },
      {
        id: "com_1_2",
        authorName: "Diego",
        authorUsername: "Di3g0",
        authorAvatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80",
        content: "Bro, el nombre da pena ajena, pero mi solo de guitarra te salvó la vida en el coro. De nada, galán. 😏🎸",
        createdAt: "Hace 3 minutos"
      }
    ],
    shares: 2,
    saved: false,
    createdAt: "Hace 10 minutos"
  },
  {
    id: "post_2",
    authorName: "Valeria",
    authorUsername: "valeee.",
    authorAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Haciendo balance de caja en Le Rock 📋🎸. De verdad no entiendo cómo Lucía sigue mezclando las facturas de cerveza con sus apuntes de bajo. Ser manager de 'Culto al Shuco' y administrar el club me va a sacar canas verdes. ¡La próxima banda que se pierda se las verá conmigo!",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=85", // Aesthetic neat counter interior
    likes: 24,
    likedByUser: false,
    comments: [
      {
        id: "com_2_1",
        authorName: "Lucía",
        authorUsername: "Lu_Lu",
        authorAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
        content: "Ay Vale, no seas dramática, las facturas están... a salvo jaja 💅💸 Mi proceso es artístico, además soy súper real y directa, no estructurada y aburrida como otras chicas de finanzas.",
        createdAt: "Hace 1 hora"
      },
      {
        id: "com_2_2",
        authorName: "Mateo Momoa",
        authorUsername: "mat.moa",
        authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80",
        content: "¡Tú puedes Valeria! Eres la mejor manager de la galaxia entera, arriba ese positivismo 🙌☀️",
        createdAt: "Hace 45 minutos"
      }
    ],
    shares: 0,
    saved: true,
    createdAt: "Hace 2 horas"
  },
  {
    id: "post_3",
    authorName: "Lucía",
    authorUsername: "Lu_Lu",
    authorAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Mucha gente me pregunta cómo logro tocar el bajo de forma tan divina e impecable siendo tan natural y sin esforzarme tanto... 🤭💅 Siento que nací con brillo propio. Y oigan, lo de mandar mal la dirección de la otra banda el mes pasado fue un accidente inocente, además gracias a eso debutamos nosotros y Mateo se volvió un meme viral de internet por electrocutarse, así que... de nada! 😘🎸",
    mediaType: "text",
    likes: 12,
    likedByUser: false,
    comments: [
      {
        id: "com_3_1",
        authorName: "Sofía",
        authorUsername: "sofi_a",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        content: "Lucía, mandaste a la banda principal a una bodega abandonada a 20 kilómetros de Le Rock... ¡Tuvimos que presentarnos de emergencia y fue un caos!",
        createdAt: "Hace 3 horas"
      },
      {
        id: "com_3_2",
        authorName: "Mateo Momoa",
        authorUsername: "mat.moa",
        authorAvatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=400&h=400&q=80",
        content: "Jajajaja ¡sí! Todavía tiemblo entero cada vez que veo un conector de metal 😂⚡ Pero qué buen show dimos, la actitud positiva nunca se cansa.",
        createdAt: "Hace 2 horas"
      }
    ],
    shares: 3,
    saved: false,
    createdAt: "Hace 4 horas"
  },
  {
    id: "post_4",
    authorName: "Diego",
    authorUsername: "Di3g0",
    authorAvatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80",
    content: "Productor de día, galán irresistible de noche. 😏 Aquí terminando de pulir los demos de Culto al Shuco (maldigo el momento en que aceptamos ese nombre, pero bueno). Mi guitarra suena tan sexy como el que la toca. Chicas, los espero hoy en Le Rock desde las 8 PM, ¿quién viene por unos tragos conmigo?",
    mediaType: "image",
    mediaUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=85", // Audio mixing console neon vibe
    likes: 45,
    likedByUser: false,
    comments: [
      {
        id: "com_4_1",
        authorName: "Valeria",
        authorUsername: "valeee.",
        authorAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80",
        content: "Diego, menos poses de seductor y más trabajo, ven a afinar tu ampli que ayer metía una estática terrible cuando Mateo empezó a cantar.",
        createdAt: "Hace 4 horas"
      },
      {
        id: "com_4_2",
        authorName: "Sofía",
        authorUsername: "sofi_a",
        authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
        content: "Qué modesto, Diego... 😂 Pero sí, hay que admitir que tienes buen oído para producir los coros.",
        createdAt: "Hace 3 horas"
      }
    ],
    shares: 8,
    saved: false,
    createdAt: "Hace 5 horas"
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "not_1",
    type: "like",
    senderName: "Sofía",
    senderAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    detailText: "le dio me gusta a tu publicación sobre nuestro ensayo de 'Culto al Shuco' 🎸",
    isRead: false,
    timestamp: "Hace 5 minutos",
    postId: "post_1"
  },
  {
    id: "not_2",
    type: "comment",
    senderName: "Diego",
    senderAvatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80",
    detailText: "comentó en tu publicación: 'Bro, el nombre da pena...'",
    isRead: false,
    timestamp: "Hace 3 minutos",
    postId: "post_1"
  },
  {
    id: "not_3",
    type: "mention",
    senderName: "Valeria",
    senderAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80",
    detailText: "te mencionó en una historia: '¡Vengan temprano hoy a Le Rock! 🎸📋'",
    isRead: false,
    timestamp: "Hace 25 minutos"
  },
  {
    id: "not_4",
    type: "follow",
    senderName: "Lucía",
    senderAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    detailText: "empezó a seguirte en Cerotalk.",
    isRead: true,
    timestamp: "Hace 1 día"
  }
];

export const INITIAL_CHATS: Chat[] = [
  {
    id: "chat_sofia",
    friendId: "sofia",
    friendName: "Sofía",
    friendAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    friendUsername: "sofi_a",
    lastMessage: "Mateo, piedad, no me hagas tocar con un cartel gigante de 'Culto al Shuco' de fondo 😭 Jaja broma, pero ensayemos el puente de la canción hoy.",
    unread: true,
    messages: [
      { id: "m1", senderId: "user", text: "Sofi, ¿cómo vas con los acordes de la nueva canción?", timestamp: "12:15 PM" },
      { id: "m2", senderId: "sofia", text: "¡Sii! Los tengo listos, los repasé hoy mientras leía un libro hermoso en el parque.", timestamp: "12:17 PM" },
      { id: "m3", senderId: "sofia", text: "Mateo, piedad, no me hagas tocar con un cartel gigante de 'Culto al Shuco' de fondo 😭 Jaja broma, pero ensayemos el puente de la canción hoy.", timestamp: "12:18 PM" }
    ]
  },
  {
    id: "chat_diego",
    friendId: "diego",
    friendName: "Diego",
    friendAvatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=150&h=150&q=80",
    friendUsername: "Di3g0",
    lastMessage: "Oye galán, ¿qué pedal alegre usaste en la mezcla de ayer? Suena excelente, muy a tu estilo contento.",
    unread: true,
    messages: [
      { id: "m4", senderId: "user", text: "Qué dice Diego, de verdad me gustó la mezcla limpia que hiciste en la consola.", timestamp: "Ayer" },
      { id: "m5", senderId: "diego", text: "Ya sabes, soy impecable en los controles y con las chicas 😏🔥 Oye galán, ¿qué pedal alegre usaste en la mezcla de ayer? Suena excelente, muy a tu estilo contento.", timestamp: "Ayer" }
    ]
  },
  {
    id: "chat_valeee",
    friendId: "valeee",
    friendName: "Valeria",
    friendAvatar: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&h=150&q=80",
    friendUsername: "valeee.",
    lastMessage: "Mateo, por favor recuérdale a Lucía que ordene las cuentas antes de que abramos Le Rock esta noche. Se le va la onda cargadísima...",
    unread: true,
    messages: [
      { id: "m6", senderId: "valeee", text: "Mateo, por favor recuérdale a Lucía que ordene las cuentas antes de que abramos Le Rock esta noche. Se le va la onda cargadísima...", timestamp: "Lunes" }
    ]
  },
  {
    id: "chat_lulu",
    friendId: "lulu",
    friendName: "Lucía",
    friendAvatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&h=150&q=80",
    friendUsername: "Lu_Lu",
    lastMessage: "Oye, ¿soy la mejor bajista o qué? Jaja Valeria está estresada por unas hojitas del balance que usé de posavasos para mi malteada 🤭💅",
    unread: true,
    messages: [
      { id: "m7", senderId: "lulu", text: "Oye, ¿soy la mejor bajista o qué? Jaja Valeria está estresada por unas hojitas del balance que usé de posavasos para mi malteada 🤭💅", timestamp: "Hace 2 días" }
    ]
  },
  {
    id: "chat_unknown",
    friendId: "marketing",
    friendName: "Cero Oficial",
    friendAvatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&h=150&q=80",
    friendUsername: "cero.talk",
    lastMessage: "Te damos la bienvenida a Cerotalk. Explora, conecta y comparte con tu banda favorita.",
    unread: true,
    messages: [
      { id: "m8", senderId: "marketing", text: "Te damos la bienvenida a Cerotalk. Explora, conecta y comparte con tu banda favorita.", timestamp: "Hace 3 días" }
    ]
  }
];

export const CONVERSATION_AUTO_REPLIES: Record<string, string[]> = {
  sofia: [
    "Jajaja de verdad, te juro que toco con total entusiasmo si nos cambiamos el nombre 🌸🎸",
    "Hoy llevaré un vestido rosa precioso para alegrar el escenario de Le Rock. 👗✨",
    "¿No es increíble que Lucía nos mande siempre al lugar equivocado? Es un peligro jaja 😂",
    "¡Súper genial! Nos leemos o nos vemos en Le Rock más tarde 📖🎸"
  ],
  diego: [
    "Ya sabes, soy irresistible dentro y fuera del escenario 😏🔥",
    "Si gustas te doy unos tips de producción musical en la cabina de Le Rock, solo para elegidos.",
    "Jajaja qué locura de concierto el de la otra vez, casi te quedas pegado al micro por la estática bro ⚡💀",
    "¡Vente a Le Rock ya, que las chicas ya andan preguntando por el guitarrista estrella! 😉🔥"
  ],
  valeee: [
    "Es que de verdad, ¿cómo alguien puede ser tan despistada con la contabilidad? 😪📋",
    "Por favor, hoy concentrados al máximo en los instrumentos, nada de incidentes eléctricos esta vez Mateo.",
    "La banda invitada confirmó... y adivina qué: yo misma les mandé el GPS correcto para evitar desastres de dirección.",
    "Gracias por el optimismo Mateo, de verdad eres el alma alegre de Le Rock 🖤☕"
  ],
  lulu: [
    "Jajaja uy no seas tan aburrido, las finanzas son súper tediosas, yo nací para ser un espíritu libre 💅✨",
    "¡A que toco el bajo mucho mejor que cualquiera por aquí, admítelo! 💋🎸",
    "Ay por favor, yo soy súper real y directa, por eso caigo tan bien en la banda 😎",
    "Oye, dile a Valeria que no me mire feo hoy en el club, yo solo quería ponerle sabor al ambiente 🥺💅"
  ],
  marketing: [
    "¡Bienvenido a Cerotalk oficial! Comparte contenido de Le Rock, Culto al Shuco y mucho más.",
    "Recuerda que puedes cambiar de cuenta libremente utilizando la barra superior del Admin.",
    "Cerotalk es el lugar donde el talento local brilla y los memes de micrófonos fluyen. ⚡🎸"
  ]
};
