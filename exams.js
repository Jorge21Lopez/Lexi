// Tareas de examen (textos originales). Formato genérico de tarea:
// {id, section:'reading'|'listening'|'uoe', paper, part, title, instructions, passage?, blocks?, choices?, audio?, questions:[{n, stem?, kind:'mcq'|'select'|'text', options?, answer?, answers?, audio?}]}
// En passage, [21] marca el hueco de la pregunta 21. audio: [['A','texto'],['B','texto']] (A y B = voces distintas).
const L8 = ['A','B','C','D','E','F','G','H'];
window.LEXI_TASKS = [
/* ===================== READING PET: PAPER 1 ===================== */
{ id:'r1p1', section:'reading', paper:'pet-r1', part:1, title:'Reading Part 1', instructions:'For each question, choose the correct answer.',
  questions:[
  { n:1, stem:'SWIMMING POOL\nFrom Monday, the pool will open at 7 a.m. instead of 8 a.m. on weekdays. Weekend times are unchanged.', kind:'mcq',
    options:['The pool will open earlier on weekdays from Monday.','The pool will be closed at weekends.','Weekend opening times will change on Monday.'], answer:'The pool will open earlier on weekdays from Monday.' },
  { n:2, stem:"Tom,\nMum called – she can't pick you up after football today, so get the bus. She'll be home by 6.\nDad", kind:'mcq',
    options:["Tom's mother will collect him later than usual.",'Tom should make his own way home.','Tom\'s father will take him to football.'], answer:'Tom should make his own way home.' },
  { n:3, stem:'LIBRARY\nBooks may be borrowed for three weeks. Please return them to the desk, not the shelves. Late returns: 20p per day.', kind:'mcq',
    options:['You can put returned books back on the shelves yourself.','You can borrow three books at a time.','You must pay if you keep a book for more than three weeks.'], answer:'You must pay if you keep a book for more than three weeks.' },
  { n:4, stem:'Sara,\nThe concert tickets are sold out online, but the box office is keeping a few to sell on the night. Shall we go early and queue?\nLily', kind:'mcq',
    options:['It may be possible to buy tickets at the venue.','Lily has already bought tickets.','The concert has been cancelled.'], answer:'It may be possible to buy tickets at the venue.' },
  { n:5, stem:'STAFF ONLY BEYOND THIS POINT\nVisitors please wait in reception and you will be collected.', kind:'mcq',
    options:['Visitors can find the staff room through here.','Visitors should not go past this point alone.','Visitors must go to reception after their meeting.'], answer:'Visitors should not go past this point alone.' }]},
{ id:'r1p2', section:'reading', paper:'pet-r1', part:2, title:'Reading Part 2', instructions:'The people below all want to join an activity. On the right there are descriptions of eight activities. Decide which activity would be most suitable for each person.',
  blocks:[
  { label:'A', title:'World Kitchen', text:'Every Tuesday and Thursday evening from 7 to 9. Learn to cook dishes from Thailand, Mexico and Morocco with our professional chefs. We provide containers so you can take everything you cook home with you.' },
  { label:'B', title:'Saturday Chef', text:'Spend your Saturday learning to make fresh pasta and classic Italian sauces. At the end of the class we all sit down together and enjoy the meal we have prepared.' },
  { label:'C', title:'Family Forest Trail', text:'Every Saturday and Sunday, our guides lead a two-hour walk through the woods with games and nature activities for children aged 4 to 10. Free of charge – just bring a picnic!' },
  { label:'D', title:"Kids' Climbing Centre", text:'Our indoor climbing walls are perfect for children aged 8 and over. Open at weekends. £25 per child per session, including equipment and an instructor.' },
  { label:'E', title:'Snap Academy', text:'Improve your photography with our online video lessons. Watch them whenever you like, practise at your own speed, and upload your photos to get personal feedback from a professional.' },
  { label:'F', title:'Camera Club', text:'Our friendly club meets every Wednesday evening at the library. Members share their photos, discuss techniques and go on group photo walks around the city once a month.' },
  { label:'G', title:'Evening Walking Group', text:'Join our relaxed walks every Monday and Thursday at 6.30 p.m. All ages and fitness levels welcome. There\'s no racing – just good conversation, fresh air and a coffee together afterwards.' },
  { label:'H', title:'Weekend First Aid Course', text:'A two-day course on Saturday and Sunday. You\'ll receive a certificate that employers recognise – ideal for anyone working in restaurants, hotels or shops.' }],
  questions:[
  { n:6, stem:'Marta wants to learn to cook food from different countries. She is only free on weekday evenings and would like to take home what she makes.', kind:'select', options:L8, answer:'A' },
  { n:7, stem:'Jonas wants to do something outdoors at the weekend with his two young children, aged 5 and 7. He doesn\'t want to spend much money.', kind:'select', options:L8, answer:'C' },
  { n:8, stem:'Priya wants to take better photos. She prefers to learn alone and at her own pace, and would like an expert to comment on her work.', kind:'select', options:L8, answer:'E' },
  { n:9, stem:"Leo would like to meet new people and get some exercise, but he doesn't enjoy competitive activities. He can only go out after 6 p.m.", kind:'select', options:L8, answer:'G' },
  { n:10, stem:'Aisha works in a hotel and wants to do a short course at the weekend that will give her a useful qualification for her job.', kind:'select', options:L8, answer:'H' }]},
{ id:'r1p3', section:'reading', paper:'pet-r1', part:3, title:'Reading Part 3', instructions:'Read the text and questions. For each question, choose the correct answer.',
  passage:`Growing together
by Hannah Clarke

When I moved into my flat in the city two years ago, the first thing I noticed from my window was an empty piece of land full of rubbish. Nobody seemed to know who it belonged to, and most of my neighbours just walked past it without a second look. I'd grown up on a farm, so I couldn't stop imagining what it could look like with vegetables and flowers in it.

It took me three months to find out that the land belonged to the city council. I wrote to them twice before I got a reply, and I have to admit I nearly gave up. In the end, they agreed to let us use it for free, as long as we kept it clean and safe.

The first weekend, I put a notice in the local shop asking for volunteers. I expected maybe five people. Twenty-three turned up, including an elderly man called Frank who had been a gardener all his life. He knew far more than I did, and he quickly became the person everyone went to for advice.

Of course, not everything went well. That first summer was extremely dry, and we lost almost half of what we'd planted. Some volunteers stopped coming, and I began to wonder whether the whole project had been a mistake. But the ones who stayed learned from it: the following year we collected rainwater and chose plants that don't need so much of it.

Today the garden supplies vegetables to a local school kitchen, and people who had lived on the same street for years without speaking now stop to chat. For me, that's the real harvest.`,
  questions:[
  { n:11, stem:'What does Hannah say about the land when she first saw it?', kind:'mcq', options:['Her neighbours wanted to do something with it.','It reminded her of the farm where she grew up.','People didn\'t seem to pay any attention to it.','It was clear who was responsible for it.'], answer:'People didn\'t seem to pay any attention to it.' },
  { n:12, stem:'How did Hannah feel while she was waiting for the council?', kind:'mcq', options:['certain that the council would agree','tempted to stop trying','annoyed with her neighbours','surprised by how quickly they replied'], answer:'tempted to stop trying' },
  { n:13, stem:'What does Hannah say about Frank?', kind:'mcq', options:['He organised the volunteers.','He had lived near the land for years.','He was more experienced than her.','He was the first person to answer the notice.'], answer:'He was more experienced than her.' },
  { n:14, stem:'What happened after the first summer?', kind:'mcq', options:['The volunteers changed the way they worked.','Most of the volunteers left the project.','Hannah decided to stop the project.','The council gave them water.'], answer:'The volunteers changed the way they worked.' },
  { n:15, stem:'What would Hannah probably write to a friend about the garden?', kind:'mcq', options:['"I wish the council had given us more support."','"We now sell our vegetables to local shops."','"Frank really should be running it instead of me."','"It\'s been hard work, but it has brought the neighbourhood closer."'], answer:'"It\'s been hard work, but it has brought the neighbourhood closer."' }]},
{ id:'r1p4', section:'reading', paper:'pet-r1', part:4, title:'Reading Part 4', instructions:'Five sentences have been removed from the text. For each question, choose the correct answer. There are three extra sentences which you do not need to use.',
  passage:`My first surfing lesson

Last summer I decided to try something completely new: surfing. I'd always watched surfers on TV and thought it looked easy. [16]

Our instructor, Jake, started the lesson on the beach, not in the water. [17] He said that if we couldn't do it on the sand, we certainly wouldn't manage it on a moving wave.

When we finally went into the sea, I was surprised by how cold it was, even in August. [18] After about ten minutes, though, I stopped noticing the temperature because I was concentrating so hard.

I fell off again and again. Every time I tried to stand up, the board seemed to disappear from under my feet. [19] Jake just laughed and told me that everyone falls hundreds of times before they succeed.

Then, near the end of the lesson, it happened. I caught a small wave, jumped up and stayed on my feet for about three seconds. [20] I've been back to the same beach four times since then, and I'm already planning my next trip.`,
  choices:[
  { label:'A', text:'I was soon to find out how wrong I was.' },
  { label:'B', text:'We practised jumping from lying down to standing on our boards again and again.' },
  { label:'C', text:'Luckily, we had all been given thick wetsuits to wear.' },
  { label:'D', text:'At one point I was so frustrated that I almost went back to the beach.' },
  { label:'E', text:'It doesn\'t sound like much, but I felt as if I\'d won a gold medal.' },
  { label:'F', text:'The water was so warm that we didn\'t need anything special to wear.' },
  { label:'G', text:'Jake had been surfing since he was five years old.' },
  { label:'H', text:'The weather forecast had promised sunshine all week.' }],
  questions:[16,17,18,19,20].map((n,i)=>({ n, kind:'select', options:L8, answer:['A','B','C','D','E'][i] }))},
{ id:'r1p5', section:'reading', paper:'pet-r1', part:5, title:'Reading Part 5', instructions:'For each question, choose the correct answer.',
  passage:`The bicycle

Today it is hard to imagine a world without bicycles, but they have only [21] for about 200 years. The first bicycle, built in Germany in 1817, had no pedals at all: riders had to [22] themselves along with their feet. Later designs added pedals, but these were often uncomfortable and even dangerous to ride. It was not until the 1880s that the 'safety bicycle' [23] the shape we recognise today, with two wheels of the same [24] and a chain. Bicycles quickly became popular because they gave ordinary people the [25] to travel further than ever before without paying for a horse or a train ticket. Today, many cities are [26] cycling again as a way of reducing traffic and pollution.`,
  questions:[
  { n:21, kind:'mcq', options:['lived','existed','appeared','happened'], answer:'existed' },
  { n:22, kind:'mcq', options:['pull','carry','push','throw'], answer:'push' },
  { n:23, kind:'mcq', options:['made','gave','held','took'], answer:'took' },
  { n:24, kind:'mcq', options:['size','length','measure','amount'], answer:'size' },
  { n:25, kind:'mcq', options:['luck','reason','chance','method'], answer:'chance' },
  { n:26, kind:'mcq', options:['advising','encouraging','persuading','insisting'], answer:'encouraging' }]},
{ id:'r1p6', section:'reading', paper:'pet-r1', part:6, title:'Reading Part 6', instructions:'For each question, write the correct answer. Write ONE word for each gap.',
  passage:`Hi Ellie,

Thanks [27] your message! I'm really sorry I haven't written for [28] long. I've been so busy with my new job. I started working [29] a receptionist at a hotel near the station three weeks ago. The work is interesting, but I have to get up really early, [30] means I'm usually in bed by ten! [31] you're free next weekend, why don't you come and stay? We could go to the new café [32] opened on my street last month.

Love,
Amy`,
  questions:[
  { n:27, kind:'text', answers:['for'] },{ n:28, kind:'text', answers:['so'] },{ n:29, kind:'text', answers:['as'] },
  { n:30, kind:'text', answers:['which'] },{ n:31, kind:'text', answers:['if'] },{ n:32, kind:'text', answers:['that','which'] }]},

/* ===================== READING PET: PAPER 2 ===================== */
{ id:'r2p1', section:'reading', paper:'pet-r2', part:1, title:'Reading Part 1', instructions:'For each question, choose the correct answer.',
  questions:[
  { n:1, stem:"CAFÉ\nSorry – our card machine isn't working today. Cash only. There's a cash machine outside the bank opposite.", kind:'mcq',
    options:['You can only pay by card today.','The café will lend you money.','You will need cash to pay here today.'], answer:'You will need cash to pay here today.' },
  { n:2, stem:"Jess – class is in room 12 tomorrow, not the usual one. Mr Hall says bring your dictionary but not the textbook. Ben", kind:'mcq',
    options:['The class will take place somewhere different tomorrow.','Jess should bring her textbook tomorrow.','Mr Hall has changed the time of the class.'], answer:'The class will take place somewhere different tomorrow.' },
  { n:3, stem:'Take two tablets twice a day after meals. Do not take for more than five days without asking your doctor.', kind:'mcq',
    options:['You should take the tablets before eating.','Ask a doctor if you need the tablets for longer than five days.','You can take four tablets at the same time.'], answer:'Ask a doctor if you need the tablets for longer than five days.' },
  { n:4, stem:'GYM – NEW MEMBERS\nPlease book a free introduction session with a trainer before using the equipment.', kind:'mcq',
    options:['New members must pay for their first session.','Trainers are only available for new members.','New members need to learn how to use the machines first.'], answer:'New members need to learn how to use the machines first.' },
  { n:5, stem:"Hi Carlos,\nThe flat viewing has moved from Thursday to Friday, same time. If Friday's no good, let me know and I'll ask the owner about the weekend.\nAnna", kind:'mcq',
    options:['The time of the viewing hasn\'t changed, only the day.','Carlos can\'t see the flat on Friday.','The owner would prefer to show the flat at the weekend.'], answer:'The time of the viewing hasn\'t changed, only the day.' }]},
{ id:'r2p2', section:'reading', paper:'pet-r2', part:2, title:'Reading Part 2', instructions:'The people below are all looking for somewhere to stay. On the right there are descriptions of eight places. Decide which place would be most suitable for each person.',
  blocks:[
  { label:'A', title:'Hillside Cottage', text:'A peaceful farm cottage miles from the nearest village. It has a fully equipped kitchen and a large garden. Pets are very welcome.' },
  { label:'B', title:'Riverside Hotel', text:'A quiet country hotel with an excellent restaurant serving local food. Beautiful walks start from the front door. Sorry, no pets.' },
  { label:'C', title:'City Backpackers', text:'Beds in shared rooms from just £18 a night, five minutes\' walk from the main museums and galleries. Free breakfast included.' },
  { label:'D', title:'The Grand', text:'Luxury rooms in the heart of the city, close to all the famous museums. Spa and rooftop restaurant. Rooms from £220 a night.' },
  { label:'E', title:'Sunshine Family Resort', text:'Two swimming pools, a kids\' club with daily activities and all meals included in the price. Parents can relax while the children have fun!' },
  { label:'F', title:'Station Business Inn', text:'Just two minutes from the central station. Every room has a large desk and high-speed internet, and our top floor is kept quiet for guests who need to work.' },
  { label:'G', title:'Surf & Stay Camp', text:'Beginners\' surf lessons are included in the price. Guests from all over the world cook and eat dinner together every evening.' },
  { label:'H', title:'Lakeside Campsite', text:'Bring your own tent and enjoy the lake. Barbecue areas and a small shop on site. Dogs allowed on a lead.' }],
  questions:[
  { n:6, stem:'Tom and Kate want somewhere quiet in the countryside where they can take their dog. They want to cook their own meals indoors.', kind:'select', options:L8, answer:'A' },
  { n:7, stem:"Rachel wants to stay in the city centre near the museums. She doesn't want to spend much money and is happy to share a room.", kind:'select', options:L8, answer:'C' },
  { n:8, stem:'The Garcia family want a place with a swimming pool and activities for their three children. They don\'t want to cook or go out for meals.', kind:'select', options:L8, answer:'E' },
  { n:9, stem:'Oliver is travelling for work. He needs a quiet place to work with good internet, and he wants to be near the train station.', kind:'select', options:L8, answer:'F' },
  { n:10, stem:'Nadia wants to try a new sport on holiday and meet other travellers. She enjoys being active.', kind:'select', options:L8, answer:'G' }]},
{ id:'r2p3', section:'reading', paper:'pet-r2', part:3, title:'Reading Part 3', instructions:'Read the text and questions. For each question, choose the correct answer.',
  passage:`A year without my smartphone
by Daniel Price

Last January, my phone fell into a river during a walking trip. I was planning to buy a new one the following week, but my sister joked that I wouldn't survive a month without it. That was all I needed to hear. I decided to try living without a smartphone for a whole year.

The first few weeks were harder than I'd expected. I kept reaching into my pocket for a phone that wasn't there, and I missed several parties because nobody remembered to send me an email instead of a message. I bought a cheap old-style phone for calls, but it couldn't do much else, and I often felt a bit left out.

After about two months, though, something changed. I started reading on the train instead of scrolling through videos, and I finished more books in six months than in the previous five years. I also found that I slept much better, probably because I no longer looked at a screen just before going to bed.

Not everything was easier. Finding my way around unfamiliar cities meant buying paper maps or asking strangers for directions – which, to my surprise, led to some of the most interesting conversations of the year. Paying for things and booking tickets took longer, and I had to plan ahead much more carefully.

When the year ended, I did buy a new smartphone. But I use it very differently now. I've deleted most of the apps, and I leave it in another room at night. I don't think everyone needs to give up their phone completely, but I'd recommend that people at least try a week without it.`,
  questions:[
  { n:11, stem:'Why did Daniel decide to stop using a smartphone?', kind:'mcq', options:['He couldn\'t afford a new one.','A doctor told him to.','He wanted to prove his sister wrong.','He was tired of receiving messages.'], answer:'He wanted to prove his sister wrong.' },
  { n:12, stem:'What was difficult for Daniel at first?', kind:'mcq', options:['He couldn\'t make phone calls.','He didn\'t find out about some social events.','His friends stopped speaking to him.','He lost his new phone.'], answer:"He didn't find out about some social events." },
  { n:13, stem:'What changed after about two months?', kind:'mcq', options:['He started to sleep less.','He travelled by train more often.','He watched more videos.','He began to spend more time reading.'], answer:'He began to spend more time reading.' },
  { n:14, stem:'What surprised Daniel about asking strangers for directions?', kind:'mcq', options:['It resulted in enjoyable conversations.','It took a very long time.','People were often unfriendly.','He usually got lost anyway.'], answer:'It resulted in enjoyable conversations.' },
  { n:15, stem:"What is Daniel's opinion now?", kind:'mcq', options:['Everyone should stop using smartphones.','Smartphones are only useful for maps.','He regrets buying a new phone.','It\'s worth spending a short time without a phone.'], answer:"It's worth spending a short time without a phone." }]},
{ id:'r2p4', section:'reading', paper:'pet-r2', part:4, title:'Reading Part 4', instructions:'Five sentences have been removed from the text. For each question, choose the correct answer. There are three extra sentences which you do not need to use.',
  passage:`Helping at the animal rescue centre

I started volunteering at our local animal rescue centre when I was sixteen. At first I only went on Saturday mornings. [16] Now, three years later, I spend most of my free time there.

The centre looks after dogs, cats and even a few rabbits that have been lost or given away by their owners. [17] Most of them are friendly, but some have had bad experiences and are nervous of people.

My main job is walking the dogs. It sounds simple, but some of the bigger dogs are much stronger than me! [18] Now I know how to stay calm and keep them under control.

The best part is when an animal finds a new home. Before that happens, the staff visit the family to make sure the house is suitable. [19] It's always a bit sad to say goodbye, but it's also a wonderful feeling.

Volunteering has helped me decide what I want to do in the future. [20] I start my course in September, and I can't wait.`,
  choices:[
  { label:'A', text:'I was given some training before I was allowed to walk them on my own.' },
  { label:'B', text:'This is to check that the animal will be safe and happy there.' },
  { label:'C', text:'I\'ve applied to study to become a vet.' },
  { label:'D', text:'When they arrive, they are checked by a vet and given a name.' },
  { label:'E', text:'But I enjoyed it so much that I soon started going after school too.' },
  { label:'F', text:'Unfortunately, rabbits are the most difficult animals to find homes for.' },
  { label:'G', text:'The centre was opened in 1995 by a local farmer.' },
  { label:'H', text:'I\'m still not sure what job I\'d like to do.' }],
  questions:[16,17,18,19,20].map((n,i)=>({ n, kind:'select', options:L8, answer:['E','D','A','B','C'][i] }))},
{ id:'r2p5', section:'reading', paper:'pet-r2', part:5, title:'Reading Part 5', instructions:'For each question, choose the correct answer.',
  passage:`The story of chocolate

People have been [21] chocolate for thousands of years, but for most of that time it was a drink, not a snack. The ancient peoples of Central America [22] cacao beans with water and spices to make a bitter drink that was often used in special ceremonies. When the Spanish brought cacao to Europe in the sixteenth century, they [23] sugar to make it sweeter, and it soon became fashionable among rich people. Solid chocolate bars did not [24] until the nineteenth century, when new machines made it possible to produce chocolate in large [25]. Today, chocolate is one of the world's most popular foods, and some people even [26] that a small amount of dark chocolate can be good for your health.`,
  questions:[
  { n:21, kind:'mcq', options:['entertaining','enjoying','amusing','delighting'], answer:'enjoying' },
  { n:22, kind:'mcq', options:['joined','connected','mixed','attached'], answer:'mixed' },
  { n:23, kind:'mcq', options:['added','increased','joined','raised'], answer:'added' },
  { n:24, kind:'mcq', options:['show','look','seem','appear'], answer:'appear' },
  { n:25, kind:'mcq', options:['numbers','quantities','sizes','measures'], answer:'quantities' },
  { n:26, kind:'mcq', options:['tell','speak','claim','talk'], answer:'claim' }]},
{ id:'r2p6', section:'reading', paper:'pet-r2', part:6, title:'Reading Part 6', instructions:'For each question, write the correct answer. Write ONE word for each gap.',
  passage:`My favourite place

The place I like best in my town is a small park [27] the river. It isn't very big, but it's [28] quiet that you can forget you're in a city. I often go there [29] myself after school to read or just to think. There are some old trees [30] were planted more than a hundred years ago, and in spring the grass is covered [31] flowers. If you ever visit my town, you [32] definitely go there!`,
  questions:[
  { n:27, kind:'text', answers:['near','by','beside','along'] },{ n:28, kind:'text', answers:['so'] },{ n:29, kind:'text', answers:['by'] },
  { n:30, kind:'text', answers:['that','which'] },{ n:31, kind:'text', answers:['with','in'] },{ n:32, kind:'text', answers:['should','must'] }]},

/* ===================== LISTENING PET ===================== */
{ id:'l1p1', section:'listening', paper:'pet-l1', part:1, title:'Listening Part 1', instructions:'For each question, choose the correct answer. (En el examen real eliges entre tres imágenes.)',
  questions:[
  { n:1, stem:'What time does the film start?', kind:'mcq', options:['7:00','7:15','7:30'], answer:'7:30',
    audio:[['A','Shall we meet at seven? The film starts at quarter past.'],['B',"Actually, I checked this morning – they've changed it. It starts at half past seven now."],['A',"Oh, OK. Then let's meet at quarter past seven outside the cinema."]] },
  { n:2, stem:'What will the man buy for his sister?', kind:'mcq', options:['a book','a scarf','a plant'], answer:'a plant',
    audio:[['B',"I was going to get my sister a book for her birthday, but she's already got so many. Maybe a scarf?"],['A','She never wears scarves. What about a plant for her new flat?'],['B',"That's a great idea. She'd love that."]] },
  { n:3, stem:'How will the woman get to the airport?', kind:'mcq', options:['by train','by taxi','by car'], answer:'by car',
    audio:[['A',"I thought about taking the train to the airport, but there's a strike tomorrow."],['B',"Why don't you get a taxi?"],['A',"It's too expensive. Anyway, my brother's offered to drive me, so that's what I'll do."]] },
  { n:4, stem:'Where were the man\'s keys?', kind:'mcq', options:['in his jacket','on the kitchen table','in his bag'], answer:'in his bag',
    audio:[['B',"I can't find my keys anywhere. I was sure they were in my jacket."],['A','Have you looked on the kitchen table?'],['B','Yes, they\'re not there either. Oh, wait – here they are, at the bottom of my bag.']] },
  { n:5, stem:'What will the weather be like tomorrow afternoon?', kind:'mcq', options:['rainy','cloudy','sunny'], answer:'sunny',
    audio:[['A',"It's been raining all week. Is it ever going to stop?"],['B',"The forecast says tomorrow will start cloudy, but it'll be sunny all afternoon."]] },
  { n:6, stem:'What does the girl want to study?', kind:'mcq', options:['medicine','law','architecture'], answer:'architecture',
    audio:[['A','Everyone thinks I\'m going to study medicine like my mum. And I did think about law for a while. But honestly, what I really want is to be an architect.']] },
  { n:7, stem:'How much did the man pay for his bike?', kind:'mcq', options:['£300','£200','£180'], answer:'£180',
    audio:[['B',"It was three hundred pounds in the shop, so I waited for the sale and got it for two hundred. Then they gave me another twenty pounds off because of a small scratch on the frame."]] }]},
{ id:'l1p2', section:'listening', paper:'pet-l1', part:2, title:'Listening Part 2', instructions:'For each question, choose the correct answer.',
  questions:[
  { n:8, stem:'You hear two friends talking about a concert. What does the woman think?', kind:'mcq', options:['The band was disappointing.','There were too many people.','The tickets were too expensive.'], answer:'There were too many people.',
    audio:[['A',"The band played really well, but honestly, the place was far too crowded. I could hardly see the stage."],['B','I know. I think they sold too many tickets.']] },
  { n:9, stem:'You hear a man talking about his new job. How does he feel about it?', kind:'mcq', options:['mainly positive','completely unsure','disappointed'], answer:'mainly positive',
    audio:[['B',"I start on Monday. I'm really looking forward to it, although I'm a bit worried about the long journey every day."],['A',"You'll get used to it."]] },
  { n:10, stem:'You hear two friends talking about where to eat. What does the woman suggest?', kind:'mcq', options:['going back to the Italian restaurant','complaining about the service','trying a different restaurant'], answer:'trying a different restaurant',
    audio:[['B','Shall we go back to that Italian place tonight?'],['A',"The food was lovely, but we waited nearly an hour last time. Let's try somewhere else."]] },
  { n:11, stem:'You hear a girl talking to her dad about a school trip. What does she say?', kind:'mcq', options:['The museum was better than she expected.','The guide was boring.','She didn\'t want to go.'], answer:'The museum was better than she expected.',
    audio:[['A',"It was amazing, Dad! I thought the museum would be really boring, but the guide made everything so interesting."]] },
  { n:12, stem:'You hear a student talking about an exam. What problem did he have?', kind:'mcq', options:['He didn\'t understand the reading.','He forgot to write his name.','He didn\'t have enough time.'], answer:"He didn't have enough time.",
    audio:[['A','How did it go?'],['B',"The reading was fine, but I ran out of time in the writing, so I couldn't check my answers."]] },
  { n:13, stem:'You hear a woman leaving a message for a friend. Why is she calling?', kind:'mcq', options:['to cancel their meeting','to apologise for being late','to change the restaurant'], answer:'to apologise for being late',
    audio:[['A',"Hi, it's me. I'm really sorry, but I'm going to be about twenty minutes late – the bus has broken down. Order without me if you're hungry."]] }]},
{ id:'l1p3', section:'listening', paper:'pet-l1', part:3, title:'Listening Part 3', instructions:'You will hear a man talking about a photography course. For each question, write the missing information (one or two words or a number).',
  audio:[['B',"Hello everyone, and welcome to our summer programme. This year's photography course for beginners will run for six weeks, starting on the fourteenth of July. Classes take place every Wednesday evening from seven until nine, in the art room on the second floor. You don't need an expensive camera – a mobile phone is fine for the first few weeks. However, please bring a notebook, because our teacher, Sophie Marsh – that's M, A, R, S, H – will give you lots of useful tips. In the last week, we'll go on a trip to the botanical gardens, where you'll photograph plants and flowers. The course costs eighty-five pounds, and that includes the entrance ticket for the trip. To book a place, visit our website or call in at the reception desk."]],
  questions:[
  { n:14, stem:'The course starts on ___ July.', kind:'text', answers:['14','14th','fourteenth','the 14th','the fourteenth'] },
  { n:15, stem:'Classes are on ___ evenings.', kind:'text', answers:['wednesday','wednesdays'] },
  { n:16, stem:'Students should bring a ___.', kind:'text', answers:['notebook','a notebook'] },
  { n:17, stem:"The teacher's surname is ___.", kind:'text', answers:['marsh'] },
  { n:18, stem:'In the last week, there is a trip to the ___ gardens.', kind:'text', answers:['botanical'] },
  { n:19, stem:'The course costs £___.', kind:'text', answers:['85','eighty-five','eighty five'] }]},
{ id:'l1p4', section:'listening', paper:'pet-l1', part:4, title:'Listening Part 4', instructions:'You will hear an interview with a young chef called Tom Reed. For each question, choose the correct answer.',
  audio:[
  ['A',"Today I'm talking to Tom Reed, who opened his own restaurant at just twenty-three. Tom, when did you first get interested in cooking?"],
  ['B',"Most people assume it was my parents, but actually neither of them enjoyed cooking. It was my grandmother. I spent every summer with her, and she let me help in the kitchen from the age of about six."],
  ['A','Did you go to cooking school?'],
  ['B',"I started a course, but I left after a year. I felt I was learning more by working in real restaurants, so I got a job washing dishes and slowly worked my way up."],
  ['A','What was the hardest part of opening your own restaurant?'],
  ['B',"People expect me to say money, and that was difficult, but finding good staff was much harder. It took me months to build a team I could trust."],
  ['A','How would you describe your food?'],
  ['B',"Simple. I use local ingredients, and I change the menu every few weeks depending on what's in season. I'm not interested in complicated dishes that look amazing but don't taste of much."],
  ['A','What do you enjoy most about your job?'],
  ['B',"Honestly, it's not the cooking any more. It's watching the young cooks in my kitchen improve and gain confidence. That's what makes me proud."],
  ['A',"And what's next for you?"],
  ['B',"A lot of people have asked me to open a second restaurant, but I'd rather make this one as good as it can be. Maybe one day I'll write a cookbook, though."]],
  questions:[
  { n:20, stem:'Who first got Tom interested in cooking?', kind:'mcq', options:['his parents','a teacher','his grandmother'], answer:'his grandmother' },
  { n:21, stem:'Why did Tom leave cooking school?', kind:'mcq', options:['He preferred learning at work.','He couldn\'t pay for it.','He failed his exams.'], answer:'He preferred learning at work.' },
  { n:22, stem:'What was the most difficult part of opening his restaurant?', kind:'mcq', options:['finding the money','finding a building','finding the right staff'], answer:'finding the right staff' },
  { n:23, stem:'How does Tom describe his food?', kind:'mcq', options:['It is complicated to prepare.','It depends on what is in season.','It looks better than it tastes.'], answer:'It depends on what is in season.' },
  { n:24, stem:'What does Tom enjoy most now?', kind:'mcq', options:['helping young cooks develop','creating new dishes','meeting customers'], answer:'helping young cooks develop' },
  { n:25, stem:"What are Tom's plans for the future?", kind:'mcq', options:['to open another restaurant','to improve his current restaurant','to become a teacher'], answer:'to improve his current restaurant' }]},

/* ===================== B2 FIRST: USE OF ENGLISH ===================== */
{ id:'u1p1', section:'uoe', paper:'fce-u1', part:1, title:'Use of English Part 1', instructions:'For each question, choose the answer (A, B, C or D) which best fits each gap.',
  passage:`Working from home

For millions of people, working from home has [1] from being a rare privilege to an everyday reality. Many employees say they are more productive without the [2] of a busy office, and they appreciate not having to spend hours travelling. However, the situation is not without its [3]. Some people find it difficult to [4] a clear line between their job and their private life, and end up working much longer hours than before. Others miss the social [5] of the workplace, such as chatting with colleagues over coffee. Companies, too, have had to [6] to the change, finding new ways to keep teams connected. Most experts [7] that the future will involve a mixture of home and office work, which may give employees the best of both [8].`,
  questions:[
  { n:1, kind:'mcq', options:['come','gone','got','made'], answer:'gone' },
  { n:2, kind:'mcq', options:['attractions','reactions','distractions','directions'], answer:'distractions' },
  { n:3, kind:'mcq', options:['drawbacks','defects','faults','failures'], answer:'drawbacks' },
  { n:4, kind:'mcq', options:['make','draw','put','set'], answer:'draw' },
  { n:5, kind:'mcq', options:['piece','section','side','share'], answer:'side' },
  { n:6, kind:'mcq', options:['fit','suit','match','adapt'], answer:'adapt' },
  { n:7, kind:'mcq', options:['agree','approve','consent','allow'], answer:'agree' },
  { n:8, kind:'mcq', options:['sides','worlds','ways','parts'], answer:'worlds' }]},
{ id:'u1p2', section:'uoe', paper:'fce-u1', part:2, title:'Use of English Part 2', instructions:'For each question, write ONE word which best fits each gap.',
  passage:`A remarkable journey

In 2019, a young woman called Lena set [9] to cycle all the way from Portugal to Norway. She had never done anything like it before, and many of her friends thought she [10] give up after a few days. [11] the bad weather and several broken tyres, she kept going. Along the way she stayed with local families, [12] of whom became close friends. The journey took her almost four months, which was much longer [13] she had planned. When she finally arrived, she said the experience had taught her more [14] herself than anything else in her life. She is now writing a book about the trip, [15] she hopes will encourage others to follow their dreams, no matter [16] difficult they seem.`,
  questions:[
  { n:9, kind:'text', answers:['out','off'] },{ n:10, kind:'text', answers:['would'] },{ n:11, kind:'text', answers:['despite'] },
  { n:12, kind:'text', answers:['some','many','several','most','all'] },{ n:13, kind:'text', answers:['than'] },{ n:14, kind:'text', answers:['about'] },
  { n:15, kind:'text', answers:['which'] },{ n:16, kind:'text', answers:['how'] }]},
{ id:'u1p3', section:'uoe', paper:'fce-u1', part:3, title:'Use of English Part 3', instructions:'Use the word given in capitals to form a word that fits in the gap.',
  passage:`The benefits of sleep

Scientists have long known that sleep is [17] (ESSENCE) for good health. Recent research shows that a lack of sleep can affect our [18] (ABLE) to concentrate and make decisions. It can also make us more [19] (EMOTION) and more likely to argue with others. [20] (FORTUNATE), many people do not get the seven to nine hours that are recommended. One [21] (EXPLAIN) is the use of phones and tablets late at night, which [22] (SIGNIFICANT) reduces the quality of our sleep. Experts give simple [23] (ADVISE): keep a regular routine and make your bedroom a [24] (RELAX) place, free from screens.`,
  questions:[
  { n:17, kind:'text', answers:['essential'] },{ n:18, kind:'text', answers:['ability'] },{ n:19, kind:'text', answers:['emotional'] },
  { n:20, kind:'text', answers:['unfortunately'] },{ n:21, kind:'text', answers:['explanation'] },{ n:22, kind:'text', answers:['significantly'] },
  { n:23, kind:'text', answers:['advice'] },{ n:24, kind:'text', answers:['relaxing'] }]},
{ id:'u1p4', section:'uoe', paper:'fce-u1', part:4, title:'Use of English Part 4', instructions:'Complete the second sentence so that it has a similar meaning to the first, using the word given. Do not change the word given. Use between two and five words.',
  questions:[
  { n:25, stem:"I haven't been to the cinema for months.\nLAST\nIt's months ___ to the cinema.", kind:'text', answers:['since i last went','since i last was','since i went'] },
  { n:26, stem:'It was such a boring film that I fell asleep.\nSO\nThe film ___ I fell asleep.', kind:'text', answers:['was so boring that','was so boring'] },
  { n:27, stem:'"Don\'t touch the paintings," the guide said to us.\nTOLD\nThe guide ___ the paintings.', kind:'text', answers:['told us not to touch'] },
  { n:28, stem:'I regret not studying harder for the exam.\nWISH\nI ___ harder for the exam.', kind:'text', answers:['wish i had studied',"wish i'd studied"] },
  { n:29, stem:'Someone stole my bike last week.\nWAS\nMy bike ___ last week.', kind:'text', answers:['was stolen'] },
  { n:30, stem:"It isn't necessary for you to bring any food.\nHAVE\nYou ___ any food.", kind:'text', answers:["don't have to bring",'do not have to bring'] }]}
];

// Papers (simulacros)
window.LEXI_PAPERS = [
  { id:'pet-r1', title:'Reading PET: simulacro 1', section:'reading', minutes:45, max:32 },
  { id:'pet-r2', title:'Reading PET: simulacro 2', section:'reading', minutes:45, max:32 },
  { id:'pet-l1', title:'Listening PET: simulacro 1', section:'listening', minutes:30, max:25 },
  { id:'fce-u1', title:'B2 First Use of English: simulacro 1', section:'uoe', minutes:45, max:30 }
];

// Speaking
window.LEXI_SPEAKING = {
  part1:["What's your name? Can you spell your surname?","Where do you live? What do you like about living there?","Do you work or are you a student?","What do you usually do at the weekend?","Tell us about your best friend.","What did you do last weekend?","What kind of music do you like? Why?","Do you prefer the city or the countryside? Why?","What's your favourite food? Can you cook it?","How do you usually travel to work or school?","Tell us about a place you'd like to visit in the future.","What do you like doing in the evenings?","Do you use the internet a lot? What for?","Tell us about your last holiday.","What sports do you like doing or watching?"],
  part2:["A photo shows a family having a picnic in a park. Two children are playing with a ball and the parents are sitting on a blanket. It's a sunny day.","A photo shows a busy kitchen in a restaurant. Three cooks in white clothes are preparing food. One of them is tasting a sauce.","A photo shows a group of teenagers in a classroom. They are looking at a laptop together and one girl is pointing at the screen.","A photo shows an old man and a young woman in a garden. They are planting flowers and smiling.","A photo shows people waiting at a train station. Some are looking at their phones; a man is running with a suitcase.","A photo shows two friends shopping in a street market. One is holding up a jacket and the other is laughing."],
  part3:[
    { title:'Un regalo de despedida', text:'A friend from your English class is moving to another country. Your class wants to give her a present. Talk together about these ideas and decide which would be best: a photo album – a cookbook of Spanish recipes – a watch – a party – a plant.', follow:["Do you think it's better to give presents or to spend time together? Why?","What's the best present you've ever received?","Is it easy to stay in touch with friends who live far away?"] },
    { title:'Actividades para un club juvenil', text:'A youth club wants to start a new weekend activity. Talk together about these ideas and decide which would be the most popular: cooking classes – a film club – a football team – a photography group – volunteering in the community.', follow:["What activities did you do when you were younger?","Should young people spend more time outdoors?","Is it important to learn new skills in your free time?"] },
    { title:'Mejorar la ciudad', text:'Your town has some money to make life better for people who live there. Talk together about these ideas and decide which is the most important: more bike lanes – a new park – a bigger library – free public transport – a sports centre.', follow:["What do you like and dislike about your town?","How will cities change in the future?","Do you think people should use cars less? Why?"] },
    { title:'Vacaciones con amigos', text:'Some friends are planning a holiday together. Talk together about these ideas and decide which would be the best: a beach holiday – a city break – camping in the mountains – a cruise – a cycling trip.', follow:["Do you prefer to go on holiday with friends or family?","Is it better to plan a holiday carefully or to be spontaneous?","What's the most interesting place you've visited?"] }]
};

// Tareas de writing adicionales (se suman a las del banco base)
window.LEXI_WRITING_EXTRA = [
  { id:'wr07', type:'writing', form:'email', cat:'writing', level:'B1', part:1, topic:'freetime', title:'Email: fin de semana de Alex (PET Part 1)', words:100, task:"Read this email from your English-speaking friend Alex and the notes you have made.\n\n\"Hi! I'm coming to stay with you next weekend. What would you like to do on Saturday? [Suggest]\nShould I bring anything special? [Tell Alex]\nI'd love to try some local food – where can we go? [Recommend]\nWhat time shall I arrive on Friday? [Explain]\"\n\nWrite your email to Alex using all the notes. Write about 100 words." },
  { id:'wr08', type:'writing', form:'email', cat:'writing', level:'B1', part:1, topic:'education', title:'Email: curso de inglés (PET Part 1)', words:100, task:"Read this email from Ms Jones, the director of an English school, and the notes you have made.\n\n\"Thank you for your interest in our summer course. Would you prefer morning or afternoon classes? [Say which and why]\nWhich activities would you like to do after class? [Choose]\nWould you like to stay with a host family or in the student residence? [Tell her]\nDo you have any questions? [Ask about…]\"\n\nWrite your email to Ms Jones using all the notes. Write about 100 words." },
  { id:'wr09', type:'writing', form:'article', cat:'writing', level:'B1', part:2, topic:'technology', title:'Artículo: una app que no podrías dejar (PET Part 2)', words:100, task:"You see this notice on an English-language website:\n\n\"Articles wanted! Which app or piece of technology could you not live without? What do you use it for? Would life be better or worse without it?\"\n\nWrite your article in about 100 words." },
  { id:'wr10', type:'writing', form:'story', cat:'writing', level:'B1', part:2, topic:'general', title:'Historia: el mensaje (PET Part 2)', words:100, task:"Your English teacher has asked you to write a story. Your story must begin with this sentence:\n\n\"The message on my phone said: 'Don't open the box until tomorrow.'\"\n\nWrite your story in about 100 words." },
  { id:'wr11', type:'writing', form:'review', cat:'writing', level:'B2', part:2, topic:'freetime', title:'B2 Review: un restaurante', words:140, task:"You see this announcement in an English-language magazine:\n\n\"Reviews wanted! Have you been to a restaurant recently that you think everyone should know about – or avoid? Write a review describing the food, the service and the atmosphere, and say whether you would recommend it.\"\n\nWrite your review in 140–190 words." },
  { id:'wr12', type:'writing', form:'essay', cat:'writing', level:'B2', part:1, topic:'environment', title:'B2 Essay: el transporte en las ciudades', words:140, task:"In your English class you have been talking about the environment. Now your teacher has asked you to write an essay:\n\n\"Should cars be banned from city centres?\"\n\nNotes – write about:\n1. pollution\n2. businesses and shops\n3. your own idea\n\nWrite your essay in 140–190 words." }
];
