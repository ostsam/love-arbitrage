export interface PropBet {
  id: string;
  question: string;
  yesOdds: string;
  noOdds: string;
  volume: string;
  expiry: string;
}

export const ALL_ASSETS = [
  { 
    symbol: '$TAY-TRAV', 
    names: 'Taylor Swift & Travis Kelce', 
    price: '42.50', 
    change: '+2.4%', 
    isUp: true, 
    volatility: 'MED', 
    category: 'Public', 
    image: 'https://images.unsplash.com/photo-1573023512520-4f10a31b4a07?q=80&w=500',
    propBets: [
      { id: '1', question: 'Engagement announced by Super Bowl?', yesOdds: '42%', noOdds: '58%', volume: '$2.4M', expiry: 'Feb 2026' },
      { id: '2', question: 'Breakup before end of 2026?', yesOdds: '15%', noOdds: '85%', volume: '$1.1M', expiry: 'Dec 2026' },
      { id: '3', question: 'Joint appearance at Grammys?', yesOdds: '72%', noOdds: '28%', volume: '$840k', expiry: 'Feb 2026' },
      { id: '4', question: 'Travis appears on a new track?', yesOdds: '65%', noOdds: '35%', volume: '$200k', expiry: 'Album Release' },
      { id: '5', question: 'Both seen in London in July?', yesOdds: '88%', noOdds: '12%', volume: '$450k', expiry: 'July 2026' },
      { id: '6', question: 'Instagram "Soft Launch" of new house?', yesOdds: '31%', noOdds: '69%', volume: '$120k', expiry: 'Q3 2026' },
      { id: '7', question: 'Seen at Wimbledon together?', yesOdds: '55%', noOdds: '45%', volume: '$300k', expiry: 'July 2026' },
      { id: '8', question: 'Travis retire from NFL for Love?', yesOdds: '12%', noOdds: '88%', volume: '$2.1M', expiry: 'End of Season' },
      { id: '9', question: 'Co-hosting a podcast episode?', yesOdds: '25%', noOdds: '75%', volume: '$90k', expiry: 'Dec 2026' },
      { id: '10', question: 'Matching tattoos confirmed?', yesOdds: '8%', noOdds: '92%', volume: '$1.5M', expiry: 'Indefinite' },
      { id: '11', question: 'Seen at a Eras Tour show in Toronto?', yesOdds: '99%', noOdds: '1%', volume: '$10k', expiry: 'Tour Dates' },
      { id: '12', question: 'Holiday card with both families?', yesOdds: '40%', noOdds: '60%', volume: '$180k', expiry: 'Dec 2026' },
      { id: '13', question: 'Taylor wears Travis jersey in public?', yesOdds: '90%', noOdds: '10%', volume: '$500k', expiry: 'Weekly' },
      { id: '14', question: 'Caught in 4K arguing in a car?', yesOdds: '15%', noOdds: '85%', volume: '$2.2M', expiry: 'Monthly' },
      { id: '15', question: 'Travis sings on stage?', yesOdds: '10%', noOdds: '90%', volume: '$1.1M', expiry: 'Tour Dates' },
      { id: '16', question: 'Paparazzi "Clash" over privacy?', yesOdds: '60%', noOdds: '40%', volume: '$400k', expiry: 'Q2 2026' },
      { id: '17', question: 'Buying property in Rhode Island?', yesOdds: '45%', noOdds: '55%', volume: '$700k', expiry: 'Dec 2026' },
      { id: '18', question: 'Both出席 Met Gala 2026?', yesOdds: '50%', noOdds: '50%', volume: '$2M', expiry: 'May 2026' },
      { id: '19', question: 'Relationship confirmed as "Staged" by leak?', yesOdds: '2%', noOdds: '98%', volume: '$5M', expiry: 'End of 2026' },
      { id: '20', question: 'Seen eating at a Waffle House?', yesOdds: '20%', noOdds: '80%', volume: '$50k', expiry: 'Dec 2026' },
      { id: '21', question: 'Publicly supporting same charity?', yesOdds: '75%', noOdds: '25%', volume: '$100k', expiry: 'Monthly' },
      { id: '22', question: 'Seen at SNL after-party together?', yesOdds: '68%', noOdds: '32%', volume: '$300k', expiry: 'Weekly' },
      { id: '23', question: 'Announce "Break" rather than breakup?', yesOdds: '33%', noOdds: '67%', volume: '$900k', expiry: 'Dec 2026' },
      { id: '24', question: 'Taylor attends away game in Buffalo?', yesOdds: '85%', noOdds: '15%', volume: '$200k', expiry: 'NFL Schedule' },
      { id: '25', question: 'Spotted at Disney World?', yesOdds: '42%', noOdds: '58%', volume: '$150k', expiry: 'Holiday' }
    ]
  },
  { 
    symbol: '$BEN-JEN', 
    names: 'Ben Affleck & Jennifer Lopez', 
    price: '12.15', 
    change: '-15.2%', 
    isUp: false, 
    volatility: 'EXTREME', 
    category: 'Public', 
    image: 'https://images.unsplash.com/photo-1618333858238-c174ee56a54d?q=80&w=500',
    propBets: [
      { id: '4', question: 'Divorce papers filed by March?', yesOdds: '88%', noOdds: '12%', volume: '$4.2M', expiry: 'Mar 2026' },
      { id: '5', question: 'Ben seen smoking stressed in car?', yesOdds: '99%', noOdds: '1%', volume: '$500k', expiry: 'Weekly' },
      { id: '26', question: 'Selling the Georgia estate?', yesOdds: '92%', noOdds: '8%', volume: '$3M', expiry: 'Q2 2026' },
      { id: '27', question: 'Joint interview "The Truth"?', yesOdds: '10%', noOdds: '90%', volume: '$1.2M', expiry: 'Dec 2026' },
      { id: '28', question: 'Seen at Dunkin together?', yesOdds: '35%', noOdds: '65%', volume: '$400k', expiry: 'Monthly' }
    ]
  },
  { 
    symbol: '$TOM-ZEND', 
    names: 'Tom Holland & Zendaya', 
    price: '89.90', 
    change: '+8.9%', 
    isUp: true, 
    volatility: 'LOW', 
    category: 'Public', 
    image: 'https://images.unsplash.com/photo-1700557477628-c200fa4cd6da?q=80&w=500',
    propBets: [
      { id: '6', question: 'Secret marriage confirmed?', yesOdds: '22%', noOdds: '78%', volume: '$1.2M', expiry: 'Q2 2026' }
    ]
  },
  { 
    symbol: '$KIM-K', 
    names: 'Kim Kardashian & ???', 
    price: '4.20', 
    change: '-0.1%', 
    isUp: false, 
    volatility: 'HIGH', 
    category: 'Public', 
    image: 'https://images.unsplash.com/photo-1552037706-e14ee6fcfb95?q=80&w=500',
    propBets: [
      { id: '7', question: 'Hard-launch new boyfriend by V-Day?', yesOdds: '35%', noOdds: '65%', volume: '$900k', expiry: 'Feb 14' }
    ]
  },
  { symbol: '$BIEBER-H', names: 'Justin & Hailey Bieber', price: '65.30', change: '-4.3%', isUp: false, volatility: 'MED', category: 'Public', image: 'https://images.unsplash.com/photo-1769230359769-fb28dfc915ed?q=80&w=500' },
  { 
    symbol: '$RIRI-ASAP', 
    names: 'Rihanna & A$AP Rocky', 
    price: '120.45', 
    change: '+1.2%', 
    isUp: true, 
    volatility: 'LOW', 
    category: 'Public', 
    image: 'https://images.unsplash.com/photo-1755119114965-107a1d419585?q=80&w=500',
    propBets: [
      { id: '301', question: 'Album announcement before breakup?', yesOdds: '5%', noOdds: '95%', volume: '$10M', expiry: '2026' }
    ]
  },
  { symbol: '$KYLIE-TIM', names: 'Kylie Jenner & Timothée Chalamet', price: '54.20', change: '+12.5%', isUp: true, volatility: 'HIGH', category: 'Public', image: 'https://images.unsplash.com/photo-1596662678434-186ae19d2879?q=80&w=500' },
  { 
    symbol: '$CHAD-BRITT', 
    names: 'Chad & Brittany', 
    price: '15.00', 
    change: '-22.5%', 
    isUp: false, 
    volatility: 'EXTREME', 
    category: 'Private', 
    image: 'https://images.unsplash.com/photo-1750959596333-df37d432f864?q=80&w=500',
    propBets: [
      { id: '101', question: 'Police called to residence tonight?', yesOdds: '64%', noOdds: '36%', volume: '$12k', expiry: '24h' },
      { id: '102', question: 'Chad sleeps on the couch?', yesOdds: '82%', noOdds: '18%', volume: '$5k', expiry: '24h' },
      { id: '103', question: 'Brittany posts cryptic IG story about "fakes"?', yesOdds: '95%', noOdds: '5%', volume: '$8k', expiry: '12h' }
    ]
  },
  { 
    symbol: '$KYLE-SARA', 
    names: 'Kyle & Sarah', 
    price: '105.40', 
    change: '+0.2%', 
    isUp: true, 
    volatility: 'LOW', 
    category: 'Private', 
    image: 'https://images.unsplash.com/photo-1516575334481-f85287c2c82d?q=80&w=500',
    propBets: [
      { id: '201', question: 'Kyle proposes by the end of dinner?', yesOdds: '78%', noOdds: '22%', volume: '$20k', expiry: 'Tonight' }
    ]
  },
  { symbol: '$JAKE-EMILY', names: 'Jake & Emily (The Yacht Fight)', price: '22.10', change: '-34.1%', isUp: false, volatility: 'EXTREME', category: 'Private', image: 'https://images.unsplash.com/photo-1708246116996-fd09cb29ac5c?q=80&w=500' },
  { symbol: '$MIKE-REB', names: 'Mike & Rebecca (Office Romance)', price: '44.80', change: '+5.5%', isUp: true, volatility: 'MED', category: 'Private', image: 'https://images.unsplash.com/photo-1607418554403-1d145ee448cb?q=80&w=500' },
  { symbol: '$ALEX-SAM', names: 'Alex & Sam', price: '92.10', change: '+0.5%', isUp: true, volatility: 'LOW', category: 'Private', image: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=500' },
  { symbol: '$JORDAN-CASEY', names: 'Jordan & Casey', price: '28.40', change: '-12.4%', isUp: false, volatility: 'HIGH', category: 'Private', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=500' },
  { symbol: '$RILEY-QUINN', names: 'Riley & Quinn', price: '45.20', change: '+2.1%', isUp: true, volatility: 'MED', category: 'Private', image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=500' },
  { symbol: '$MORGAN-TAYLOR', names: 'Morgan & Taylor', price: '15.75', change: '-45.0%', isUp: false, volatility: 'EXTREME', category: 'Private', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=500' },
  { symbol: '$PARKER-SKYLER', names: 'Parker & Skyler', price: '5.20', change: '-89.2%', isUp: false, volatility: 'CRITICAL', category: 'Private', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500' },
  { symbol: '$JAMIE-LOGAN', names: 'Jamie & Logan', price: '68.30', change: '+1.4%', isUp: true, volatility: 'LOW', category: 'Private', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=500' },
  { symbol: '$AVERY-BAILEY', names: 'Avery & Bailey', price: '12.90', change: '-5.2%', isUp: false, volatility: 'HIGH', category: 'Private', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=500' },
  { symbol: '$CHRIS-DANA', names: 'Chris & Dana', price: '110.00', change: '+12.4%', isUp: true, volatility: 'LOW', category: 'Private', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=500' },
  { symbol: '$FIN-SAGE', names: 'Fin & Sage', price: '34.20', change: '-18.5%', isUp: false, volatility: 'HIGH', category: 'Private', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=500' },
];

export const RECENT_BETS = [
  { symbol: '$TAY-TRAV', side: 'LONG', amount: '$425.00', status: 'OPEN', pnl: '+$12.40', pnlUp: true },
  { symbol: '$BEN-JEN', side: 'SHORT', amount: '$1,000.00', status: 'OPEN', pnl: '+$240.50', pnlUp: true },
  { symbol: '$CHAD-BRITT', side: 'SHORT', amount: '$50.00', status: 'CLOSED', pnl: '-$15.00', pnlUp: false },
];
