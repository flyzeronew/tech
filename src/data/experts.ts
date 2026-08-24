export interface ExpertArticle {
    date: string;
    image: string;
    title: string;
    description: string;
    href: string;
}

export interface Expert {
    slug: string;
    avatar: string;
    firstName: string;
    lastName: string;
    tags: string[];
    description: string;
    quote: string;
    articles: ExpertArticle[];
}

export const experts: Expert[] = [
    {
        slug: 'richard-brown',
        avatar: '/expert01.jpg',
        firstName: 'Richard',
        lastName: 'Brown',
        tags: ['產業評論者', '外資視角'],
        description: '以外資與國際資本視角，剖析台灣科技產業在全球供應鏈中的位置，為外資企業與跨國決策者提供第一手洞察。',
        quote: 'Technology alone does not create advantage; the ability to adapt your strategy around it is where true value lies.',
        articles: [
            {
                date: '2026/07/10',
                image: '/news-image-01.jpg',
                title: 'AVC and Auras Lead Taiwan’s AI Thermal Surge',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
            {
                date: '2026/07/08',
                image: '/news-image-02.jpg',
                title: 'Taiwan’s AI Server Makers Extend Record Run in May',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
            {
                date: '2026/07/05',
                image: '/news-image-03.jpg',
                title: 'Computex 2026: The Move to Optical Gathers Speed',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
        ],
    },
    {
        slug: 'dimitri-bruyas',
        avatar: '/expert02.jpg',
        firstName: 'Dimitri',
        lastName: 'Bruyas',
        tags: ['英語新聞組組長', '前《英文中國郵報》總編輯'],
        description: '在台深耕媒體超過 20 年，擅長融合國際新聞觀點，以全英語、全方位角度報導台灣科技與半導體產業脈動，為海外決策者提供深度台灣視角。',
        quote: 'Taiwan’s story is best told by reporters who live inside it—every headline here carries two decades of ground-level context.',
        articles: [
            {
                date: '2026/07/09',
                image: '/news-image-04.jpg',
                title: 'AVC and Auras Lead Taiwan’s AI Thermal Surge',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
            {
                date: '2026/07/06',
                image: '/news-image-05.jpg',
                title: 'Taiwan’s AI Server Makers Extend Record Run in May',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
            {
                date: '2026/07/03',
                image: '/news-image-06.jpg',
                title: 'Computex 2026: The Move to Optical Gathers Speed',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
        ],
    },
    {
        slug: '王瑀玟',
        avatar: '/expert03.jpg',
        firstName: '王',
        lastName: '瑀玟',
        tags: ['亞利桑那觀察'],
        description: '常駐亞利桑那，第一線協助台灣企業落地，從文化、人才到供應鏈，記錄台美半導體聚落的真實樣貌。',
        quote: 'A semiconductor cluster isn’t built by machines alone—it’s built by the people who choose to move their lives across the Pacific.',
        articles: [
            {
                date: '2026/07/11',
                image: '/news-image-01.jpg',
                title: 'AVC and Auras Lead Taiwan’s AI Thermal Surge',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
            {
                date: '2026/07/07',
                image: '/news-image-02.jpg',
                title: 'Taiwan’s AI Server Makers Extend Record Run in May',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
            {
                date: '2026/07/02',
                image: '/news-image-03.jpg',
                title: 'Computex 2026: The Move to Optical Gathers Speed',
                description: 'Analyzing Taiwan’s role in global supply chains through an international capital lens—delivering critical insights for global executives and investors.',
                href: '#',
            },
        ],
    },
];
