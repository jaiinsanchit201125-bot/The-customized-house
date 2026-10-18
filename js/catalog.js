/* The Customized House - product catalogue
   To add a design: put the picture in assets/shop/<category>/ and add one line to that category.
   mrp = price shown crossed out, price = selling price.
   art = optional transparent PNG of just the design (lets customers open it in the Design Studio). */
window.TCH_CATEGORIES = {
  tshirt:     {name:'T-Shirts',          blurb:'Soft 180 GSM cotton tees with bold prints. Pick a design, choose your size and order on WhatsApp.', studio:'tshirt'},
  oversized:  {name:'Oversized T-Shirts',blurb:'Heavy drop-shoulder tees with a relaxed fit.', studio:'oversized'},
  hoodie:     {name:'Hoodies',           blurb:'320 GSM brushed fleece hoodies.', studio:'hoodie'},
  sweatshirt: {name:'Sweatshirts',       blurb:'Crewneck fleece sweatshirts.', studio:'sweatshirt'},
  jacket:     {name:'Jackets',           blurb:'Zip jackets and hoodies.', studio:'jacket'}
};
const T = 'assets/shop/tshirt/';
window.TCH_CATALOG = {
  tshirt: [
    {id:'all-we-need-is-money', name:'All We Need Is Money', img:T+'all-we-need-is-money.jpg', colour:'Black', print:'Back print', mrp:899, price:699, tags:['black','streetwear'],
     desc:'Gothic lettering with a torn-paper money print across the back. A loud streetwear statement.'},
    {id:'faith-over-fear', name:'Faith Over Fear', img:T+'faith-over-fear.jpg', art:T+'faith-over-fear-art.png', colour:'Black', print:'Front print', mrp:899, price:699, tags:['black','graphic'],
     desc:'A vintage-style angel graphic with "Trust the unseen" - distressed print on a black tee.'},
    {id:'seek', name:'Seek', img:T+'seek.jpg', colour:'Beige', print:'Back print', mrp:899, price:699, tags:['beige','retro'],
     desc:'Retro red "SEEK" type with an eye illustration, printed big on the back.'},
    {id:'homies', name:'Sidestreet Homies', img:T+'homies.jpg', art:T+'homies-art.png', colour:'White', print:'Front print', mrp:899, price:699, tags:['white','graphic'],
     desc:'Street-style dog graphic with neon star eyes and drip details.'},
    {id:'peace-enjoy-the-wind', name:'Peace - Enjoy The Wind', img:T+'peace-enjoy-the-wind.jpg', colour:'Beige', print:'Back print', mrp:899, price:699, tags:['beige','graphic'],
     desc:'A white dove with red roses and bold PEACE lettering on the back.'},
    {id:'built-different', name:'Built Different', img:T+'built-different.jpg', colour:'Black', print:'Front print', mrp:899, price:699, tags:['black','minimal'],
     desc:'Clean, bold "BUILT DIFFERENT" chest print. Simple and strong.'},
    {id:'im-peace', name:"I'm Peace", img:T+'im-peace.jpg', art:T+'im-peace-art.png', colour:'White', print:'Front print', mrp:899, price:699, tags:['white','retro'],
     desc:'A detailed retro hippie illustration with groovy "I\'M PEACE" type.'},
    {id:'life-is-an-adventure', name:'Life Is An Adventure', img:T+'life-is-an-adventure.jpg', art:T+'life-is-an-adventure-art.png', colour:'Black', print:'Front print', mrp:899, price:699, tags:['black','retro'],
     desc:'A vintage van and palm trees on a three-colour retro panel.'},
    {id:'peace-hand', name:'Peace Sign', img:T+'peace-hand.jpg', art:T+'peace-hand-art.png', colour:'Black', print:'Front print', mrp:899, price:699, tags:['black','minimal'],
     desc:'Hand-painted orange peace sign that pops on black.'},
    {id:'think-outside-the-box', name:'Think Outside The Box', img:T+'think-outside-the-box.jpg', art:T+'think-outside-the-box-art.png', colour:'White', print:'Front print', mrp:899, price:699, tags:['white','minimal'],
     desc:'Hand-drawn tic-tac-toe with a twist. Fun, clever and easy to wear.'},
    {id:'raglan-tee', name:'Classic Raglan Tee', img:T+'raglan-tee.jpg', colour:'White / Black', print:'Plain', mrp:899, price:699, tags:['plain','white'],
     desc:'Two-tone raglan with black sleeves. Wear it plain or add your own print.'},
    {id:'acid-wash-tee', name:'Acid Wash Tee', img:T+'acid-wash-tee.jpg', colour:'Charcoal acid wash', print:'Plain', mrp:899, price:699, tags:['plain','black'],
     desc:'Vintage acid-wash finish with a boxy fit. Wear it plain or add your own print.'}
  ],
  oversized: [], hoodie: [], sweatshirt: [], jacket: []
};
