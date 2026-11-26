/* ================= quiz show =================
   A category starts at once with built-in questions; an own topic asks the AI.
   Whoever starts a round publishes it whole (questions and start time) in their presence, and every player
   runs the same timeline on their own clock: nobody waits for anybody's ticks, and the round goes on when
   its starter leaves. Answers travel in each player's own presence; everyone adds up the same scores. */
function myPeer(){try{const m=room&&room.peers().find(p=>p.isMe&&p.sameTab);return m?m.peer:'me';}catch(e){return 'me';}}
function rankLess(a,b){for(let i=0;i<3;i++){if(a[i]<b[i])return true;if(a[i]>b[i])return false;}return false;}
function shuffled(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// one question per line: question|right answer|wrong|wrong
const Q_CATS=[
['mix','Gemischt',''],
['geo','Geografie',`
Was ist die Hauptstadt von Kanada?|Ottawa|Toronto|Vancouver
Was ist die Hauptstadt von Australien?|Canberra|Sydney|Melbourne
Welcher Fluss fließt durch Köln?|Rhein|Elbe|Main
Welcher Fluss fließt durch München?|Isar|Main|Inn
Welcher Ozean ist der größte?|Pazifik|Atlantik|Indischer Ozean
Wie heißt der höchste Berg der Welt?|Mount Everest|K2|Kilimandscharo
Wie heißt der höchste Berg Deutschlands?|Zugspitze|Watzmann|Feldberg
In welchem Land liegt Machu Picchu?|Peru|Chile|Mexiko
Welches Land hat die Form eines Stiefels?|Italien|Griechenland|Portugal
Welcher Kontinent ist der größte?|Asien|Afrika|Nordamerika
Wie viele Bundesländer hat Deutschland?|16|15|14
Welches ist das flächenmäßig kleinste Bundesland?|Bremen|Saarland|Hamburg
In welchem Land stehen die Pyramiden von Gizeh?|Ägypten|Mexiko|Sudan
Welche Stadt wird „Big Apple“ genannt?|New York|Chicago|Los Angeles
Welcher Staat ist der kleinste der Welt?|Vatikanstadt|Monaco|San Marino
Wie heißt die Hauptstadt von Neuseeland?|Wellington|Auckland|Christchurch
Welche ist die größte heiße Wüste der Erde?|Sahara|Gobi|Kalahari
An welchem Meer liegt Kiel?|Ostsee|Nordsee|Mittelmeer
In welchem Land liegt Porto?|Portugal|Spanien|Italien
Welcher Fluss ist der längste Europas?|Wolga|Donau|Rhein
Was ist die Hauptstadt von Spanien?|Madrid|Barcelona|Sevilla
Welche Stadt liegt an der Themse?|London|Dublin|Edinburgh
Auf welchem Kontinent liegt Kenia?|Afrika|Asien|Südamerika
Was ist die Hauptstadt der Schweiz?|Bern|Zürich|Genf`],
['his','Geschichte',`
In welchem Jahr fiel die Berliner Mauer?|1989|1991|1987
Wer war der erste Bundeskanzler der Bundesrepublik?|Konrad Adenauer|Willy Brandt|Ludwig Erhard
Wer betrat als erster Mensch den Mond?|Neil Armstrong|Buzz Aldrin|Juri Gagarin
In welchem Jahr landeten Menschen zum ersten Mal auf dem Mond?|1969|1967|1972
Wer segelte 1492 im Auftrag Spaniens nach Amerika?|Christoph Kolumbus|Vasco da Gama|Ferdinand Magellan
In welchem Jahr endete der Zweite Weltkrieg in Europa?|1945|1944|1946
In welchem Jahr wurde Deutschland wiedervereinigt?|1990|1989|1991
Was war die Hauptstadt der DDR?|Ost-Berlin|Leipzig|Dresden
Wer erfand in Europa den Buchdruck mit beweglichen Lettern?|Johannes Gutenberg|Martin Luther|Albrecht Dürer
In welchem Jahr wurde die Bastille gestürmt?|1789|1776|1815
Welches Bauwerk sollte China vor Angriffen aus dem Norden schützen?|Die Chinesische Mauer|Die Verbotene Stadt|Der Himmelstempel
Wer war die erste Bundeskanzlerin Deutschlands?|Angela Merkel|Ursula von der Leyen|Annegret Kramp-Karrenbauer
Welches Schiff sank 1912 nach dem Zusammenstoß mit einem Eisberg?|Titanic|Lusitania|Bismarck
In welchem Jahr kam der Euro als Bargeld?|2002|1999|2001
Wer flog 1961 als erster Mensch ins All?|Juri Gagarin|Neil Armstrong|John Glenn
Wo fanden 1896 die ersten Olympischen Spiele der Neuzeit statt?|Athen|Paris|London
Wer veröffentlichte 1517 die 95 Thesen?|Martin Luther|Johannes Calvin|Ulrich Zwingli
Welche Königin regierte das Vereinigte Königreich über 70 Jahre?|Elisabeth II.|Victoria|Anne
Wer war der erste Präsident der USA?|George Washington|Abraham Lincoln|Thomas Jefferson
Welche Stadt richtete 1972 die Olympischen Sommerspiele aus?|München|Montreal|Moskau
Welches Volk baute Machu Picchu?|Inka|Azteken|Maya
In welcher Stadt stand das Kolosseum schon in der Antike?|Rom|Athen|Karthago`],
['nat','Natur & Tiere',`
Wie viele Beine hat eine Spinne?|8|6|10
Welches ist das größte Tier der Welt?|Blauwal|Afrikanischer Elefant|Pottwal
Welches ist das schnellste Landtier?|Gepard|Löwe|Gazelle
Welches dieser Tiere ist ein Säugetier?|Delfin|Hai|Thunfisch
Welches Säugetier legt Eier?|Schnabeltier|Fledermaus|Delfin
Wie viele Herzen hat ein Oktopus?|3|1|2
Welches Gas nehmen Pflanzen für die Photosynthese auf?|Kohlendioxid|Sauerstoff|Stickstoff
Was frisst ein Panda hauptsächlich?|Bambus|Fisch|Beeren
Wie nennt man ein junges Pferd?|Fohlen|Kalb|Lamm
Welcher Vogel kann rückwärts fliegen?|Kolibri|Spatz|Schwalbe
Welches Tier hat den längsten Hals?|Giraffe|Strauß|Kamel
Wovon ernähren sich Koalas fast nur?|Eukalyptusblättern|Bambus|Gras
Welche Farbe hat das Blut eines Oktopus?|Blau|Rot|Grün
Wie viele Arme hat ein Seestern meistens?|5|6|8
Welcher Baum trägt Eicheln?|Eiche|Buche|Linde
Welches dieser Tiere hält Winterschlaf?|Igel|Fuchs|Reh
Zu welcher Tiergruppe gehört der Frosch?|Amphibien|Reptilien|Fische
Wie viele Flügel hat eine Biene?|4|2|6
Welche Blume gilt als Symbol der Niederlande?|Tulpe|Rose|Sonnenblume
Welches Tier ist das größte an Land?|Afrikanischer Elefant|Nashorn|Giraffe
Wie heißt ein männliches Huhn?|Hahn|Erpel|Ganter
Was sammeln Bienen in Blüten?|Nektar|Harz|Tau`],
['sci','Wissenschaft',`
Wofür steht H₂O?|Wasser|Wasserstoffperoxid|Kochsalz
Was ist das chemische Symbol für Gold?|Au|Ag|Go
Welcher Planet ist der Sonne am nächsten?|Merkur|Venus|Mars
Welcher Planet wird „der Rote Planet“ genannt?|Mars|Venus|Jupiter
Welcher ist der größte Planet im Sonnensystem?|Jupiter|Saturn|Neptun
Wie viele Knochen hat ein erwachsener Mensch?|206|156|306
Wie viele Kammern hat das menschliche Herz?|4|2|3
Welches Metall ist bei Raumtemperatur flüssig?|Quecksilber|Blei|Zinn
Welches Gas macht den größten Teil der Luft aus?|Stickstoff|Sauerstoff|Kohlendioxid
Wer entwickelte die Relativitätstheorie?|Albert Einstein|Isaac Newton|Niels Bohr
Welches Vitamin bildet der Körper mithilfe von Sonnenlicht?|Vitamin D|Vitamin C|Vitamin A
Bei wie viel Grad kocht Wasser auf Meereshöhe?|100 °C|90 °C|120 °C
Was ist das größte Organ des Menschen?|Die Haut|Die Leber|Die Lunge
Wie viel Grad hat ein rechter Winkel?|90|180|45
Was ist die kleinste Primzahl?|2|1|3
Wie lange braucht Sonnenlicht ungefähr bis zur Erde?|8 Minuten|8 Sekunden|8 Stunden
Wer entdeckte das Penicillin?|Alexander Fleming|Louis Pasteur|Robert Koch
In welcher Einheit misst man elektrischen Widerstand?|Ohm|Volt|Ampere
Welcher Planet hat die auffälligsten Ringe?|Saturn|Mars|Venus
Wie viele Zähne hat ein Erwachsener mit Weisheitszähnen?|32|28|36
Bei wie viel Grad gefriert Wasser?|0 °C|4 °C|-10 °C
Was zieht ein Magnet an?|Eisen|Kupfer|Aluminium`],
['food','Essen & Trinken',`
Aus welchem Land kommt die Pizza Margherita?|Italien|Frankreich|Griechenland
Woraus wird Tofu gemacht?|Sojabohnen|Reis|Kichererbsen
Woraus wird Guacamole gemacht?|Avocado|Gurke|Erbsen
Aus welcher Pflanze wird Tequila gemacht?|Agave|Kaktusfeige|Zuckerrohr
Aus welchem Land kommt Sushi?|Japan|China|Korea
Woraus besteht Hummus hauptsächlich?|Kichererbsen|Linsen|Bohnen
Welches Gewürz ist das teuerste der Welt?|Safran|Vanille|Zimt
Welche Zutat macht Bier bitter?|Hopfen|Malz|Hefe
Was ist die Hauptzutat von Pesto Genovese?|Basilikum|Petersilie|Spinat
Welche Nuss steckt in Nutella?|Haselnuss|Walnuss|Mandel
Aus welchem Land kommt Paella?|Spanien|Italien|Portugal
Welche Stadt ist für Weißwürste bekannt?|München|Hamburg|Köln
Was ist Matcha?|Grüntee als Pulver|Gerösteter Reis|Japanischer Kaffee
Woraus wird Popcorn gemacht?|Mais|Reis|Weizen
Aus welchem Land kommt der Camembert?|Frankreich|Schweiz|Belgien
Aus welchem Land kommt Kimchi?|Korea|Japan|Thailand
Welcher Käse hat große Löcher?|Emmentaler|Gouda|Feta
Woraus wird Schokolade gemacht?|Kakaobohnen|Kaffeebohnen|Haselnüssen
Welches Getränk ist ein Espresso mit viel Milchschaum?|Cappuccino|Americano|Ristretto
Woraus macht man Pommes?|Kartoffeln|Süßkartoffeln|Maniok
Was ist ein Croissant?|Ein Blätterteig-Hörnchen|Ein Hefezopf|Ein Brötchen mit Käse
Aus welchem Land kommt die Pho-Suppe?|Vietnam|Thailand|China`],
['pop','Film & Musik',`
Welches Instrument hat meistens 88 Tasten?|Klavier|Orgel|Akkordeon
Wie viele Saiten hat eine normale Gitarre?|6|5|7
Welcher Komponist wurde in Bonn geboren?|Ludwig van Beethoven|Wolfgang Amadeus Mozart|Johann Sebastian Bach
Wer komponierte „Die Zauberflöte“?|Mozart|Haydn|Beethoven
Aus welchem Land kommt die Band ABBA?|Schweden|Norwegen|Dänemark
Aus welcher Stadt kommen die Beatles?|Liverpool|London|Manchester
Wie heißt die Zauberschule in den Harry-Potter-Büchern?|Hogwarts|Durmstrang|Beauxbatons
Welcher Film gewann 2020 als erster nicht englischsprachiger den Oscar für den besten Film?|Parasite|Roma|Amélie
Wer wurde „King of Pop“ genannt?|Michael Jackson|Elvis Presley|Prince
Wer wurde „King of Rock ’n’ Roll“ genannt?|Elvis Presley|Chuck Berry|Little Richard
In welcher Stadt liegt Hollywood?|Los Angeles|San Francisco|San Diego
Wie heißt der wichtigste Filmpreis Hollywoods?|Oscar|Emmy|Grammy
Wie viele Musiker spielen in einem Quartett?|4|3|5
Welches Instrument spielt man mit einem Bogen?|Geige|Trompete|Harfe
Welche Band sang „Bohemian Rhapsody“?|Queen|The Rolling Stones|Pink Floyd
In welchem Land entstand K-Pop?|Südkorea|Japan|China
Wer führte Regie bei „Titanic“ von 1997?|James Cameron|Steven Spielberg|Ridley Scott
Welche Pille nimmt Neo in „Matrix“?|Die rote|Die blaue|Die grüne
Welcher Musikwettbewerb wird jedes Jahr zwischen Ländern ausgetragen?|Eurovision Song Contest|Grammy Awards|Echo
In welchem Film spielt ein Fisch namens Nemo?|Findet Nemo|Arielle|Shark Tale
Wie heißt der Zauberer in „Der Herr der Ringe“?|Gandalf|Merlin|Dumbledore
Welches Instrument hat Pedale und Saiten?|Harfe|Cello|Mandoline`],
['sport','Sport & Spiele',`
Wie viele Spieler einer Fußballmannschaft stehen auf dem Feld?|11|10|12
Wie lange dauert ein Fußballspiel regulär?|90 Minuten|80 Minuten|100 Minuten
Wie viele Ringe zeigt die olympische Flagge?|5|4|6
Welches Land wurde 2014 Fußball-Weltmeister?|Deutschland|Argentinien|Brasilien
Wie viele Felder hat ein Schachbrett?|64|81|100
In welcher Sportart gibt es einen Slam Dunk?|Basketball|Volleyball|Handball
Wie viele Punkte zählt ein Touchdown?|6|3|7
Welches große Tennisturnier wird auf Rasen gespielt?|Wimbledon|French Open|US Open
Welche Schachfigur zieht nur diagonal?|Läufer|Turm|Springer
Wie viele Augen hat ein Würfel zusammen?|21|18|24
Wie lang ist ein Marathon ungefähr?|42 km|21 km|50 km
In welchem Land fanden die Olympischen Spiele der Antike statt?|Griechenland|Italien|Ägypten
Welche Kugel bringt beim Snooker die meisten Punkte?|Schwarz|Pink|Blau
Wie viele Spieler hat eine Volleyballmannschaft auf dem Feld?|6|5|7
In welcher Sportart spielt man um den Stanley Cup?|Eishockey|Baseball|Basketball
Wie heißt das Videospiel mit fallenden Blöcken aus der Sowjetunion?|Tetris|Pac-Man|Pong
Wie viele Löcher hat ein normaler Golfplatz?|18|9|12
Wie viele Pins stehen beim Bowling?|10|9|12
Wie viele Karten hat ein Pokerblatt ohne Joker?|52|48|54
In welcher Sportart gibt es einen Elfmeter?|Fußball|Rugby|Tennis
Wie oft im Jahr finden Olympische Sommerspiele statt?|Alle 4 Jahre|Alle 2 Jahre|Jedes Jahr
Mit welchem Gerät spielt man Badminton?|Schläger und Federball|Schläger und Gummiball|Stock und Puck`],
['tech','Technik & Internet',`
In welchem Jahr wurde das erste iPhone vorgestellt?|2007|2005|2009
Welche Programmiersprache entwickelte Guido van Rossum?|Python|Ruby|Java
Wofür steht „www“?|World Wide Web|Wide World Web|Web World Wide
Wie viele Bits hat ein Byte?|8|4|16
Welche Firma entwickelt Android?|Google|Apple|Microsoft
Wer gründete Microsoft zusammen mit Paul Allen?|Bill Gates|Steve Jobs|Larry Page
In welchem Jahr wurde Google gegründet?|1998|1996|2001
Wofür steht „PDF“?|Portable Document Format|Personal Data File|Print Document Form
Welcher Konzern gehört zu Instagram?|Meta|Google|Snap
Mit welcher Tastenkombination kopiert man unter Windows?|Strg + C|Strg + V|Strg + X
Welche Firma baut die PlayStation?|Sony|Nintendo|Microsoft
Wofür steht „USB“?|Universal Serial Bus|United System Board|Universal Signal Box
Aus welchem Land kommt die Firma hinter TikTok?|China|USA|Südkorea
Wofür steht „GPS“?|Global Positioning System|General Position Service|Global Phone Signal
Wer erfand das World Wide Web?|Tim Berners-Lee|Steve Wozniak|Mark Zuckerberg
Welches Gerät ließ sich Alexander Graham Bell 1876 patentieren?|Telefon|Glühbirne|Radio
Wofür steht „KI“?|Künstliche Intelligenz|Kreative Information|Kombinierte Informatik
Welche Farbe hat das Spotify-Logo?|Grün|Blau|Rot
Welche Firma stellt das MacBook her?|Apple|Dell|Samsung
Was bedeutet „WLAN“ wörtlich?|Kabelloses lokales Netzwerk|Weltweites Netz|Schnelles Mobilfunknetz
Welches Netzwerk war für 280-Zeichen-Posts bekannt?|Twitter|Facebook|LinkedIn
Was speichert ein Browser-Cookie?|Kleine Daten von Websites|Fotos vom Handy|Passwörter des Routers`],
['art','Kunst & Bücher',`
Wer malte die Mona Lisa?|Leonardo da Vinci|Michelangelo|Raffael
Wer malte „Die Sternennacht“?|Vincent van Gogh|Claude Monet|Paul Cézanne
Wer schrieb „Romeo und Julia“?|William Shakespeare|Johann Wolfgang von Goethe|Charles Dickens
Wer schrieb „Faust“?|Johann Wolfgang von Goethe|Friedrich Schiller|Gotthold Ephraim Lessing
Wer malte die Decke der Sixtinischen Kapelle?|Michelangelo|Raffael|Botticelli
In welchem Museum hängt die Mona Lisa?|Louvre|Prado|Uffizien
Wer schrieb „Der kleine Prinz“?|Antoine de Saint-Exupéry|Jules Verne|Victor Hugo
Wer schrieb die Harry-Potter-Bücher?|J. K. Rowling|Roald Dahl|J. R. R. Tolkien
Wer schrieb „Der Herr der Ringe“?|J. R. R. Tolkien|C. S. Lewis|George R. R. Martin
Wer erfand den Detektiv Sherlock Holmes?|Arthur Conan Doyle|Agatha Christie|Edgar Allan Poe
In welcher Stadt wurde 1919 das Bauhaus gegründet?|Weimar|Dessau|Berlin
Welche Farben mischt man für Orange?|Rot und Gelb|Blau und Gelb|Rot und Blau
Welche Farbe entsteht aus Blau und Gelb?|Grün|Lila|Orange
Wer malte „Der Schrei“?|Edvard Munch|Gustav Klimt|Egon Schiele
Welcher Künstler malte berühmte Suppendosen?|Andy Warhol|Roy Lichtenstein|Keith Haring
Wer schrieb „Die Verwandlung“?|Franz Kafka|Thomas Mann|Hermann Hesse
Wer schrieb „Pippi Langstrumpf“?|Astrid Lindgren|Erich Kästner|Michael Ende
Wer schrieb „Die unendliche Geschichte“?|Michael Ende|Cornelia Funke|Otfried Preußler
Wie heißt Klimts berühmtes Bild mit viel Gold?|Der Kuss|Die Umarmung|Der Traum
Wer schrieb „Die Leiden des jungen Werthers“?|Goethe|Schiller|Heine
Wer malte „Das Mädchen mit dem Perlenohrring“?|Jan Vermeer|Rembrandt|Rubens
Wie heißt die Kunstrichtung von Picasso mit eckigen Formen?|Kubismus|Impressionismus|Barock`],
];

const QB={};Q_CATS.forEach(([k,,s])=>{if(s)QB[k]=s.trim().split('\n').map(l=>l.trim().split('|')).filter(x=>x.length===4&&x.every(Boolean));});
const QCAT_NAME=Object.fromEntries(Q_CATS.map(c=>[c[0],c[1]]));
const Q_N=8, Q_T=12000, Q_R=2800, Q_LEAD=3200, Q_GEN=30000;

const quizM=document.getElementById('quizM'), qJoin=document.getElementById('qJoin');
let qMine=null,      // the round I started: what I publish as presence "qs"
    qOpen=false,     // my quiz window is open: I am playing
    qMy={id:'',a:{}},// my answers in the round I play
    qCur=null,       // the round I play, kept when its starter goes away
    qErr='', qOff={}, qBook={}, qSoundK='', qBeepK='';
function qHash(t){let h=5381;t=String(t);for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return (h>>>0).toString(36).slice(-6);}
const qSeen=(()=>{try{const a=JSON.parse(localStorage.getItem('garden-quiz-seen')||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string'&&x.length<=6).slice(-300):[];}catch(e){return [];}})();
const qAsked=(()=>{try{const a=JSON.parse(localStorage.getItem('garden-quiz-asked')||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string').slice(-30):[];}catch(e){return [];}})();
function qMarkSeen(q){const h=qHash(q);if(qSeen.includes(h))return;qSeen.push(h);if(qSeen.length>300)qSeen.splice(0,qSeen.length-300);try{localStorage.setItem('garden-quiz-seen',JSON.stringify(qSeen));}catch(e){}}

/* ---- what travels ---- */
function qClean(g){
  if(!g||typeof g!=='object'||typeof g.id!=='string'||!/^q[0-9a-z]{4,16}$/.test(g.id))return null;
  const qs=(Array.isArray(g.qs)?g.qs:[]).slice(0,10).map(x=>Array.isArray(x)&&Array.isArray(x[1])&&x[1].length===3&&Number.isInteger(x[2])&&x[2]>=0&&x[2]<3?[str(x[0],200),x[1].map(o=>str(o,60)),x[2]]:null).filter(Boolean);
  const cut=(Array.isArray(g.cut)?g.cut:[]).slice(0,10).map(v=>Number.isFinite(v)?v:0);
  const ph=g.ph==='gen'?'gen':'play';
  if(ph==='play'&&!qs.length)return null;
  return {id:g.id,ph,top:str(g.top,40),ck:QB[g.ck]?g.ck:'',by:str(g.by,14)||'Friend',t0:num(g.t0,0),qs,cut,at:num(g.at,0)};
}
function qPub(){if(room)room.presence({qs:qMine?{id:qMine.id,ph:qMine.ph,top:qMine.top,ck:qMine.ck,by:qMine.by,t0:qMine.t0,qs:qMine.qs,cut:qMine.cut,at:qMine.at}:null}).catch(()=>{});}
function qPubMe(){if(room)room.presence({qz:qOpen?{id:qMy.id,a:qMy.a,h:qSeen.slice(-100)}:null}).catch(()=>{});}
function qAns(a){const o={};if(a&&typeof a==='object')for(const k in a){const i=+k,x=a[k];if(Number.isInteger(i)&&i>=0&&i<10&&Array.isArray(x)&&Number.isInteger(x[0])&&x[0]>=0&&x[0]<3)o[i]=[x[0],clamp(num(x[1],Q_T),0,Q_T)];}return o;}
// how far a friend's clock is from mine: the smallest gap between their send time and my receive time
function qOffOf(p){const t=num(p.presence&&p.presence._t,0);if(t){const o=Date.now()-t;if(!(p.peer in qOff)||o<qOff[p.peer])qOff[p.peer]=o;}return qOff[p.peer]||0;}
function qFriends(){return room?roomPeers().filter(p=>!p.isMe&&p.kind==='viewer'&&p.presence):[];}

/* ---- the timeline everyone runs ---- */
function qTimes(g){const S=[],R=[];let t=g.t0;for(let i=0;i<g.qs.length;i++){S.push(t);let r=t+Q_T;if(g.cut[i]&&g.cut[i]<r)r=Math.max(t+1200,g.cut[i]);R.push(r);t=r+Q_R;}return {S,R,end:t};}
function qPhase(g,now){
  if(!g)return {ph:'none'};if(g.ph==='gen')return {ph:'gen'};
  const T=qTimes(g);if(now<T.S[0])return {ph:'count',left:T.S[0]-now,T};
  for(let i=0;i<g.qs.length;i++){if(now<T.R[i])return {ph:'q',i,left:T.R[i]-now,T};if(now<T.R[i]+Q_R&&now<(i+1<g.qs.length?T.S[i+1]:T.end))return {ph:'rev',i,T};}
  return {ph:'end',T};
}
function qRounds(){
  const out=[];if(qMine)out.push(Object.assign({},qMine,{peer:myPeer(),mine:true,raw:qMine.at}));
  qFriends().forEach(p=>{const g=qClean(p.presence.qs);if(!g)return;const o=qOffOf(p);
    out.push(Object.assign(g,{t0:g.t0?g.t0+o:0,cut:g.cut.map(v=>v?v+o:0),raw:g.at,at:g.at+o,peer:p.peer}));});
  if(qCur&&!out.some(g=>g.id===qCur.id))out.push(qCur);
  return out;
}
// which of two rounds wins is decided on the starters' own times, so every device picks the same one
function qFirst(a,b){return a.raw-b.raw||String(a.peer).localeCompare(String(b.peer));}
function qOpenRounds(now){return qRounds().filter(g=>g.ph==='gen'?now-g.at<Q_GEN+4000:qPhase(g,now).ph!=='end');}
// the round on screen: the oldest one still going (two starts at once: the first wins), else the one I just played
function qRound(){
  const now=Date.now(),open=qOpenRounds(now);
  if(open.length){open.sort(qFirst);return open[0];}
  return qCur&&now-qTimes(qCur).end<600000?qCur:null;
}
function quizState(){const g=qRound();return g&&qPhase(g,Date.now()).ph!=='end'?{ph:'q',by:g.by,mine:!!g.mine}:null;}
function qPlayers(g){
  const L=[],inG=g&&g.ph!=='gen';
  if(qOpen)L.push({peer:myPeer(),n:me().name||'Ich',l:me().look,a:inG&&qMy.id===g.id?qMy.a:{},me:true});
  qFriends().forEach(p=>{const z=p.presence.qz;if(!z||typeof z!=='object')return;if(inG&&z.id!==g.id)return;
    L.push({peer:p.peer,n:str(p.presence.n,14)||'Friend',l:cleanLook(p.presence.l),a:inG?qAns(z.a):{}});});
  // friends who left during the round still count in its results
  const B=inG&&qBook[g.id];if(B)for(const k in B)if(!L.some(p=>p.peer===k))L.push(Object.assign({peer:k,gone:true},B[k]));
  return L.slice(0,8);
}
function qScore(g,a,upto){let s=0;for(let i=0;i<=upto&&i<g.qs.length;i++){const x=a&&a[i];if(x&&x[0]===g.qs[i][2])s+=100+Math.round(50*clamp(1-x[1]/Q_T,0,1));}return s;}
function qUpto(g,P){return P.ph==='end'?g.qs.length-1:P.ph==='rev'?P.i:P.ph==='q'?P.i-1:-1;}

/* ---- starting a round ---- */
function qPick(cat){
  const pool=cat==='mix'?Object.values(QB).flat():(QB[cat]||[]);
  const seen=[new Set(qSeen)];qFriends().forEach(p=>{const z=p.presence.qz;if(z&&Array.isArray(z.h))seen.push(new Set(z.h.filter(x=>typeof x==='string').slice(-150)));});
  const sc=shuffled(pool).map(x=>({x,n:seen.reduce((k,S)=>k+(S.has(qHash(x[0]))?1:0),0)}));sc.sort((a,b)=>a.n-b.n);
  return sc.slice(0,Q_N).map(({x:[q,r,w1,w2]})=>{const o=shuffled([r,w1,w2]);return [q,o,o.indexOf(r)];});
}
function qNew(ph,top,qs,ck){const now=Date.now();qMine={id:'q'+now.toString(36)+Math.random().toString(36).slice(2,5),ph,top,ck:ck||'',by:(me().name||'Friend').slice(0,14),t0:ph==='play'?now+Q_LEAD:0,qs:qs||[],cut:[],at:now};qErr='';qPub();qTick();}
function qCanStart(){return qOpen&&!qOpenRounds(Date.now()).length;}
function qStartCat(cat){if(!qCanStart())return;Sfx.click();qNew('play',QCAT_NAME[cat]||'Gemischt',qPick(cat),cat);}
async function qStartTopic(t){
  t=String(t||'').trim().slice(0,60);if(!t||!qCanStart())return;
  const make=window.__quiz&&window.__quiz.make;if(!make){qErr='Eigene Themen gehen hier gerade nicht. Nimm eine Kategorie.';qRender(true);return;}
  Sfx.click();qNew('gen',t);const id=qMine.id;
  const r=await Promise.race([make({topic:t,level:'mittel',n:Q_N,avoid:qAsked.slice(-20)}),new Promise(f=>setTimeout(()=>f({error:'slow'}),Q_GEN))]);
  if(!qMine||qMine.id!==id)return;
  const ok=x=>x&&typeof x.q==='string'&&x.q.trim()&&Array.isArray(x.o)&&x.o.length===3&&x.o.every(v=>String(v).trim())&&new Set(x.o.map(v=>String(v).trim().toLowerCase())).size===3&&Number.isInteger(x.a)&&x.a>=0&&x.a<3;
  const qs=(r&&Array.isArray(r.qs)?r.qs:[]).filter(ok).slice(0,Q_N).map(x=>{const o=x.o.map(v=>String(v).trim().slice(0,60)),idx=shuffled([0,1,2]);return [x.q.trim().slice(0,200),idx.map(i=>o[i]),idx.indexOf(x.a)];});
  if(qs.length<4){qMine=null;qPub();qErr=r&&r.error==='limit'?'Eigene Themen sind für heute aufgebraucht. Nimm eine Kategorie.':'Dazu kamen gerade keine Fragen. Nochmal versuchen oder eine Kategorie nehmen.';qRender(true);return;}
  qs.forEach(q=>qAsked.push(q[0]));try{localStorage.setItem('garden-quiz-asked',JSON.stringify(qAsked.slice(-30)));}catch(e){}
  qMine.qs=qs;qMine.ph='play';qMine.t0=Date.now()+Q_LEAD;qPub();qTick();
}
function qAnswer(c){
  const g=qRound(),P=qPhase(g,Date.now());
  if(!qOpen||!g||P.ph!=='q'||qMy.id!==g.id||qMy.a[P.i])return;
  qMy.a[P.i]=[c,Math.round(Date.now()-P.T.S[P.i])];Sfx.click();qPubMe();qTick();
}

/* ---- every 100 ms ---- */
function qTick(){
  const now=Date.now();
  if(qMine){
    // two rounds started at the same moment: the earlier one wins, mine steps back
    const open=qOpenRounds(now).sort(qFirst);
    if(open.length&&!open[0].mine){qMine=null;qPub();}
    else if(qMine.ph==='play'){const P=qPhase(qMine,now);
      if(P.ph==='end'){qMine=null;qPub();}
      // everybody answered: show the answer now instead of waiting out the clock
      else if(P.ph==='q'&&!qMine.cut[P.i]){const ps=qPlayers(Object.assign({},qMine,{mine:true})).filter(p=>!p.gone);
        if(ps.length&&ps.every(p=>p.a[P.i])){qMine.cut[P.i]=now+500;qPub();}}
    } else if(qMine.ph==='gen'&&now-qMine.at>Q_GEN+4000){qMine=null;qPub();}
  }
  const g=qRound();
  if(qOpen&&g&&g.ph==='play'&&qPhase(g,now).ph!=='end'){if(qMy.id!==g.id){qMy={id:g.id,a:{}};qPubMe();}qCur=g;}
  // keep who played what, for the results after they leave
  if(g&&g.ph==='play')qPlayers(g).forEach(p=>{if(p.gone)return;(qBook[g.id]=qBook[g.id]||{})[p.peer]={n:p.n,l:p.l,a:p.a};});
  if(qOpen){const P=qPhase(g,now);
    if(P.ph==='q'&&qMy.id===g.id)qMarkSeen(g.qs[P.i][0]);
    // 3, 2, 1, go
    if(P.ph==='count'){const n=Math.ceil(P.left/1000);if(n<=3&&qBeepK!==g.id+n){qBeepK=g.id+n;try{Sfx.beep(false);}catch(e){}}}
    else if(P.ph==='q'&&P.i===0&&qBeepK!==g.id+'go'&&P.T.S[0]>now-600){qBeepK=g.id+'go';try{Sfx.beep(true);}catch(e){}}
    const sk=g?g.id+P.ph+(P.i??''):'';
    if(sk!==qSoundK){qSoundK=sk;try{if(P.ph==='rev'&&qMy.id===g.id&&qMy.a[P.i]&&qMy.a[P.i][0]===g.qs[P.i][2])Sfx.yay(.5);}catch(e){}}
    if(P.ph==='end'&&g.ph==='play'&&qConfId!==g.id&&qMy.id===g.id){qConfId=g.id;const up=g.qs.length-1,ps=qPlayers(g),sc=ps.map(p=>qScore(g,p.a,up)),top=Math.max(0,...sc);
      if(top>0&&ps.some((p,i)=>p.me&&sc[i]===top))qConfetti();}
    qRender();}
  const show=!qOpen&&scene==='house'&&g&&!g.mine&&g.ph==='play'&&qPhase(g,now).ph!=='end';
  if(qJoin.hidden===!!show)qJoin.hidden=!show;
  if(show){const tx=`Quiz läuft bei ${g.by}: mitmachen`;if(qJoin.textContent!==tx)qJoin.textContent=tx;}
}
setInterval(qTick,100);

function openQuiz(){qOpen=true;qErr='';qOwn=false;quizM.classList.add('show');qPubMe();qTick();qRender(true);}
function closeQuiz(){
  quizM.classList.remove('show');qConf.hidden=true;qOpen=false;qCur=null;qPubMe();
  // a round with friends in it keeps running without me; an empty one or one still being written ends
  if(qMine&&(qMine.ph==='gen'||!qPlayers(Object.assign({},qMine,{mine:true})).some(p=>!p.gone))){qMine=null;qPub();}
}
document.getElementById('qClose').onclick=closeQuiz;
qJoin.onclick=()=>{qJoin.hidden=true;openQuiz();};

/* ---- drawing: calm and plain. Night blue, cream, one yellow; green and red only for right and wrong ---- */
const qStage=document.getElementById('qStage'),qsx=qStage.getContext('2d');
function qRender(force){
  if(!quizM.classList.contains('show'))return;
  const now=Date.now(),g=qRound(),P=qPhase(g,now),players=qPlayers(g),upto=g&&g.ph==='play'?qUpto(g,P):-1;
  const board=document.getElementById('qBoard'),opts=document.getElementById('qOpts'),lobby=document.getElementById('qLobby'),info=document.getElementById('qInfo'),bar=document.getElementById('qBar');
  const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!==undefined)e.textContent=x;return e;};
  const pop=(e,t)=>{if(e.textContent===t)return;e.textContent=t;e.classList.remove('pop');void e.offsetWidth;e.classList.add('pop');};
  const keyed=(e,k,build)=>{if(!force&&e.dataset.k===k)return;e.dataset.k=k;const old=e.querySelector('input'),v=old?old.value:'',f=!!old&&document.activeElement===old;e.innerHTML='';build(v,f);};
  const playing=P.ph==='count'||P.ph==='q'||P.ph==='rev';
  board.className='qboard'+(P.ph==='count'?' big':'')+(board.classList.contains('pop')?' pop':'');
  // progress: one small square per question
  keyed(info,playing&&P.ph!=='count'?'d'+g.qs.length+'|'+P.i+P.ph:playing?'t'+g.top:'',()=>{
    if(!playing)return;if(P.ph==='count'){info.textContent=String(g.top).toUpperCase();return;}
    for(let k=0;k<g.qs.length;k++)info.appendChild(el('i',k<P.i||(k===P.i&&P.ph==='rev')?'done':k===P.i?'now':''));});
  bar.hidden=P.ph!=='q';
  if(P.ph==='q'){bar.style.setProperty('--w',(100*P.left/Q_T).toFixed(1)+'%');bar.classList.toggle('low',P.left<3500);}
  if(P.ph==='count'){pop(board,String(Math.ceil(P.left/1000)));keyed(opts,'',()=>{});keyed(lobby,'c'+g.id,()=>lobby.appendChild(el('div','qnote',g.mine?'Gleich geht’s los':`${g.by} hat „${g.top}“ gestartet`)));}
  else if(P.ph==='q'||P.ph==='rev'){
    const q=g.qs[P.i],joined=qMy.id===g.id,x=joined&&qMy.a[P.i],mine=x?x[0]:-1;
    pop(board,q[0]);
    keyed(opts,[g.id,P.i,P.ph,mine,joined?1:0].join('|'),()=>{
      q[1].forEach((o,i)=>{const b=el('button','qopt',o);b.type='button';
        if(P.ph==='rev'){b.disabled=true;b.classList.add(i===q[2]?'right':i===mine?'bad':'wrong');}
        else{if(i===mine)b.classList.add('mine');if(mine>=0||!joined)b.disabled=true;}
        b.onclick=()=>qAnswer(i);opts.appendChild(b);});});
    // one quiet line: saved, who we wait for, right or wrong
    let fb='',fc='';
    if(P.ph==='q'&&x){const wait=players.filter(p=>!p.gone&&!p.me&&!p.a[P.i]).map(p=>p.n);fb=wait.length?'Warte auf '+wait.slice(0,3).join(', '):'';fc='wait';}
    else if(P.ph==='rev'){if(x&&x[0]===q[2]){fb='Richtig  +'+(100+Math.round(50*clamp(1-x[1]/Q_T,0,1)));fc='ok';}else{fb=x?'Leider falsch':'Zu spät';fc='bad';}}
    keyed(lobby,'fb|'+fc+fb,()=>{if(fb)lobby.appendChild(el('div','qfb '+fc,fb));});
  } else {
    keyed(opts,'',()=>{});
    const ended=P.ph==='end'&&g,gen=P.ph==='gen';let rank=[];
    if(ended)rank=players.map(p=>({p,s:qScore(g,p.a,upto)})).sort((a,b)=>b.s-a.s);
    const tie=rank.length>1&&rank[0].s===rank[1].s;
    pop(board,gen?`„${g.top}“`:ended?(tie?'Unentschieden':rank.length?(rank[0].p.me?'Du gewinnst':`${rank[0].p.n} gewinnt`):'Fertig'):'Was spielen wir?');
    keyed(lobby,['L',gen?g.id:'',ended?g.id+rank.map(r=>r.p.peer+r.s).join():'',qErr,qOwn?1:0].join('|'),(v,f)=>{
      if(gen){lobby.appendChild(el('div','qnote',g.mine?'Die Fragen werden geschrieben …':`${g.by} hat ein Thema ausgesucht …`));
        if(g.mine){const c=el('button','qlink','Abbrechen');c.type='button';c.onclick=()=>{qMine=null;qPub();qRender(true);};lobby.appendChild(c);}return;}
      if(ended&&rank.length){const R=el('ol','qrank');rank.forEach((r,i)=>{const li=el('li',i===0&&!tie&&r.s>0?'win':'');li.appendChild(el('span','',(r.p.me?'Du':r.p.n)));li.appendChild(el('b','',String(r.s)));R.appendChild(li);});lobby.appendChild(R);}
      const again=ended&&g.ck?g.ck:'mix',go=el('button','qgo',ended?'Nochmal':'Los geht’s');go.type='button';go.onclick=()=>qStartCat(again);lobby.appendChild(go);
      const C=el('div','qchips');
      Q_CATS.forEach(([k,n])=>{if(k==='mix')return;const b=el('button','',n);b.type='button';b.onclick=()=>qStartCat(k);C.appendChild(b);});
      const own=el('button','own',qOwn?'×':'Eigenes Thema …');own.type='button';own.onclick=()=>{qOwn=!qOwn;qRender(true);};C.appendChild(own);
      lobby.appendChild(C);
      if(qOwn){const row=el('div','row'),inp=el('input','inp');inp.maxLength=60;inp.autocomplete='off';inp.placeholder='Thema eintippen';inp.value=v;inp.setAttribute('aria-label','Eigenes Thema');
        const b=el('button','btn dark','Los');b.type='button';b.onclick=()=>qStartTopic(inp.value);inp.addEventListener('keydown',e=>{if(e.key==='Enter')b.click();});
        row.appendChild(inp);row.appendChild(b);lobby.appendChild(row);setTimeout(()=>{if(qOwn&&!f)inp.focus();},0);if(f)inp.focus();}
      if(qErr)lobby.appendChild(el('div','qnote',qErr));
    });
  }
  qStageArgs=[g,P,players,upto];
}
let qOwn=false,qStageArgs=null,qConfAt=0,qConfId='';
const Q_CONF=['#f2c94c','#e8506c','#4fb3e8','#7cf08a','#ffffff','#c98aff','#ff9a3c'];
(function qFrame(){requestAnimationFrame(qFrame);if(!qStageArgs||!quizM.classList.contains('show'))return;const [g,,players,upto]=qStageArgs;qDrawStage(g,qPhase(g,Date.now()),players,upto);qDrawConf();})();
// the players: avatars on one line, a small mark over a head when they answered, the winner hops with a crown
function qDrawStage(g,P,players,upto){
  const W=160,H=36,X=qsx,t=performance.now(),play=g&&g.ph==='play',end=play&&P.ph==='end';
  X.clearRect(0,0,W,H);X.fillStyle='#3a3266';for(let x=2;x<W;x+=4)X.fillRect(x,30,2,1);
  const n=Math.max(1,players.length),sc=players.map(p=>play?qScore(g,p.a,upto):0),top=Math.max(0,...sc),tie=sc.filter(v=>v===top).length>1;
  const inQ=play&&(P.ph==='q'||P.ph==='rev'),revAt=P.ph==='rev'?P.T.R[P.i]:0;
  players.forEach((p,i)=>{
    const cx=Math.round((i+.5)*W/n),win=end&&top>0&&!tie&&sc[i]===top,x=inQ&&p.a[P.i],ok=x&&P.ph==='rev'?x[0]===g.qs[P.i][2]:null;
    const hop=win?Math.round(Math.abs(Math.sin(t/220))*4):ok?Math.round(Math.abs(Math.sin((Date.now()-revAt)/140))*3*Math.max(0,1-(Date.now()-revAt)/1500)):0;
    if(!p.gone)drawAvatar(X,cx,29-hop,p.l,{blink:false,t:0});
    if(win){const y=3-hop;X.fillStyle='#f2c94c';X.fillRect(cx-4,y+2,9,3);X.fillRect(cx-4,y,1,2);X.fillRect(cx,y-1,1,3);X.fillRect(cx+4,y,1,2);
      for(let k=0;k<16;k++){const yy=((t/1000*(12+k%4*4)+k*9)%30),xx=cx-12+((k*19)%25);X.fillStyle=Q_CONF[k%Q_CONF.length];X.fillRect(xx,yy,(k+Math.floor(t/150))%3?2:1,1);}}
    else if(x){X.fillStyle=ok===null?'#fff6e0':ok?'#7cf08a':'#e8506c';X.fillRect(cx+5,5,3,3);}
  });
  const names=document.getElementById('qNames');
  const nk=players.map((p,i)=>p.peer+':'+p.n+':'+(p.me?1:0)+':'+(play?sc[i]:'')).join(',');
  if(names.dataset.k!==nk){names.dataset.k=nk;names.innerHTML='';
    players.forEach((p,i)=>{const d=document.createElement('div');d.textContent=p.me?'Du':p.n;if(play){const b=document.createElement('b');b.textContent=sc[i];d.appendChild(b);}names.appendChild(d);});}
}
// whoever wins gets confetti over the whole screen
const qConf=document.getElementById('qConf'),qcx=qConf.getContext('2d');let qBits=[];
function qConfetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const w=qConf.width=Math.ceil(innerWidth/4),h=qConf.height=Math.ceil(innerHeight/4);
  qBits=Array.from({length:140},(_,i)=>({x:Math.random()*w,y:-Math.random()*h*.9,v:.35+Math.random()*.6,s:Math.random()*6.3,c:Q_CONF[i%Q_CONF.length],r:Math.random()<.5}));
  qConfAt=performance.now();qConf.hidden=false;try{Sfx.yay(.8);}catch(e){}
}
function qDrawConf(){
  if(qConf.hidden)return;const t=performance.now()-qConfAt,w=qConf.width,h=qConf.height;
  if(t>5200){qConf.hidden=true;return;}
  qcx.clearRect(0,0,w,h);qcx.globalAlpha=t>4200?1-(t-4200)/1000:1;
  qBits.forEach(b=>{b.y+=b.v;b.x+=Math.sin(t/300+b.s)*.3;qcx.fillStyle=b.c;if((Math.floor(t/120)+b.s*3|0)%3)qcx.fillRect(b.x|0,b.y|0,b.r?2:1,b.r?1:2);else qcx.fillRect(b.x|0,b.y|0,1,1);});
  qcx.globalAlpha=1;
}
