/* ================= quiz show (multiplayer via presence) ================= */
const QBANK=[
 ['Wie viele Spieler einer Fußballmannschaft stehen auf dem Feld?',['11','10','12'],0],
 ['Welche Farbe entsteht, wenn man Blau und Gelb mischt?',['Grün','Lila','Orange'],0],
 ['Welcher Planet ist der Sonne am nächsten?',['Merkur','Venus','Mars'],0],
 ['In welcher Stadt steht der Eiffelturm?',['Paris','Lyon','Brüssel'],0],
 ['Welches Gas nehmen Pflanzen für die Photosynthese auf?',['Kohlendioxid','Sauerstoff','Stickstoff'],0],
 ['Wie viele Beine hat eine Spinne?',['8','6','10'],0],
 ['Was ist die Hauptstadt von Kanada?',['Toronto','Ottawa','Vancouver'],1],
 ['Welcher Ozean ist der größte?',['Pazifik','Atlantik','Indischer Ozean'],0],
 ['Wer malte die Mona Lisa?',['Leonardo da Vinci','Michelangelo','Raffael'],0],
 ['Wie heißt der höchste Berg der Welt?',['Mount Everest','K2','Kilimandscharo'],0],
 ['Welcher Fluss fließt durch Köln?',['Rhein','Elbe','Main'],0],
 ['Wie viele Tage hat ein Schaltjahr?',['366','365','364'],0],
 ['Welche Sprache spricht man in Brasilien?',['Portugiesisch','Spanisch','Französisch'],0],
 ['Welches Instrument hat meistens 88 Tasten?',['Klavier','Orgel','Akkordeon'],0],
 ['Wer schrieb „Romeo und Julia“?',['William Shakespeare','Johann Wolfgang von Goethe','Charles Dickens'],0],
 ['Wofür steht die Formel H₂O?',['Wasser','Wasserstoffperoxid','Kochsalz'],0],
 ['Welches dieser Tiere ist ein Säugetier?',['Delfin','Hai','Thunfisch'],0],
 ['In welchem Land stehen die Pyramiden von Gizeh?',['Ägypten','Mexiko','Sudan'],0],
 ['Wie viele Seiten hat ein Sechseck?',['6','5','8'],0],
 ['Welcher Komponist wurde in Bonn geboren?',['Ludwig van Beethoven','Wolfgang Amadeus Mozart','Johann Sebastian Bach'],0],
 ['Welche Farbe hat ein Smaragd?',['Grün','Rot','Blau'],0],
 ['Welches Organ pumpt das Blut durch den Körper?',['Herz','Lunge','Leber'],0],
 ['Wie viele Ringe zeigt die olympische Flagge?',['5','4','6'],0],
 ['In welcher Stadt findet das Oktoberfest statt?',['München','Stuttgart','Nürnberg'],0],
 ['Welcher Planet wird „der Rote Planet“ genannt?',['Mars','Venus','Jupiter'],0],
 ['Welches Metall ist bei Raumtemperatur flüssig?',['Quecksilber','Blei','Zinn'],0],
 ['Welches ist das flächenmäßig kleinste Bundesland?',['Bremen','Saarland','Hamburg'],0],
 ['Wie heißt die Währung Japans?',['Yen','Won','Yuan'],0],
 ['Was ist das chemische Symbol für Gold?',['Au','Ag','Go'],0],
 ['Wie viele Kammern hat das menschliche Herz?',['4','2','3'],0],
 ['Welches Land hat die Form eines Stiefels?',['Italien','Griechenland','Spanien'],0],
 ['Wer erfand in Europa den Buchdruck mit beweglichen Lettern?',['Johannes Gutenberg','Martin Luther','Albrecht Dürer'],0],
 ['Welcher Kontinent ist der größte?',['Asien','Afrika','Nordamerika'],0],
 ['Welche Stadt wird „Big Apple“ genannt?',['New York','Chicago','Los Angeles'],0],
 ['Welches ist das schnellste Landtier?',['Gepard','Löwe','Gazelle'],0],
 ['Was ist die Hauptstadt von Österreich?',['Wien','Salzburg','Graz'],0],
 ['Welches Vitamin bildet der Körper mithilfe von Sonnenlicht?',['Vitamin D','Vitamin C','Vitamin A'],0],
 ['Wie viel Grad hat ein rechter Winkel?',['90','180','45'],0],
 ['Welches Land wurde 2014 Fußball-Weltmeister?',['Deutschland','Argentinien','Brasilien'],0],
 ['Wer betrat als erster Mensch den Mond?',['Neil Armstrong','Buzz Aldrin','Juri Gagarin'],0],
 ['Was ist die Hauptstadt Chinas?',['Peking','Shanghai','Hongkong'],0],
 ['Wie heißt das chinesische Neujahrsfest auch?',['Frühlingsfest','Laternenfest','Drachenbootfest'],0],
 ['Was bedeutet „Nǐ hǎo“ auf Deutsch?',['Hallo','Danke','Tschüss'],0],
 ['Wie heißt der höchste Berg Deutschlands?',['Zugspitze','Watzmann','Feldberg'],0],
 ['Wie viele Felder hat ein Schachbrett?',['64','81','100'],0],
 ['Wie viele Saiten hat eine klassische Gitarre?',['6','5','7'],0],
 ['Wie viele Bundesländer hat Deutschland?',['16','15','17'],0],
 ['Welches Tier ist auf der Flagge von Wales zu sehen?',['Drache','Löwe','Adler'],0],
 ['Welches dieser Säugetiere legt Eier?',['Schnabeltier','Delfin','Fledermaus'],0],
 ['Was ist die Hauptstadt von Spanien?',['Madrid','Barcelona','Sevilla'],0],
 ['Welches ist der größte Planet unseres Sonnensystems?',['Jupiter','Saturn','Neptun'],0],
 ['Wie viele Knochen hat ein erwachsener Mensch?',['206','156','306'],0],
 ['In welchem Jahr fiel die Berliner Mauer?',['1989','1991','1987'],0],
 ['Was ist die Hauptstadt von Australien?',['Sydney','Canberra','Melbourne'],1],
 ['Welches ist das größte Tier der Welt?',['Afrikanischer Elefant','Blauwal','Pottwal'],1],
 ['Wie heißt die Hauptstadt Chinas?',['Shanghai','Peking','Hongkong'],1],
 ['Wer malte die Mona Lisa?',['Michelangelo','Leonardo da Vinci','Raffael'],1],
 ['Wie lange dauert ein Fußballspiel regulär?',['80 Minuten','90 Minuten','100 Minuten'],1],
 ['Welches chemische Symbol hat Gold?',['Au','Ag','Go'],0],
 ['Auf welchem Kontinent liegt Ägypten?',['Asien','Afrika','Europa'],1],
 ['Wie viele Saiten hat eine normale Gitarre?',['6','5','8'],0],
 ['Welcher Fluss fließt durch München?',['Main','Isar','Inn'],1],
 ['Welches Land hat die meisten Einwohner?',['China','Indien','USA'],1],
 ['Wie heißt der höchste Berg der Welt?',['K2','Mount Everest','Kangchendzönga'],1],
 ['Welches Gas nehmen Pflanzen für die Photosynthese auf?',['Sauerstoff','Kohlendioxid','Stickstoff'],1],
 ['Wie viele Tage hat ein Schaltjahr?',['365','366','364'],1],
 ['Welche Sprache hat die meisten Muttersprachler?',['Englisch','Mandarin','Spanisch'],1],
 ['Welcher Planet wird „Roter Planet“ genannt?',['Venus','Mars','Merkur'],1],
 ['Wie viele Spieler einer Fußballmannschaft stehen auf dem Feld?',['11','10','12'],0],
 ['Welches ist das flächenmäßig kleinste Bundesland?',['Bremen','Saarland','Hamburg'],0],
 ['Wer schrieb „Der Steppenwolf“?',['Thomas Mann','Hermann Hesse','Franz Kafka'],1],
 ['Wem wird der Satz „Ich weiß, dass ich nichts weiß“ zugeschrieben?',['Sokrates','Platon','Aristoteles'],0],
 ['Wie heißt das chinesische Neujahrsfest noch?',['Frühlingsfest','Laternenfest','Mondfest'],0],
 ['Welches Organ pumpt das Blut durch den Körper?',['Lunge','Herz','Leber'],1],
 ['Wie viele Kontinente zählt man üblicherweise?',['5','7','6'],1],
 ['Was ist H₂O?',['Wasser','Wasserstoffperoxid','Kochsalz'],0],
 ['Welcher Ozean ist der größte?',['Atlantik','Pazifik','Indischer Ozean'],1],
 ['Welches Instrument hat meistens 88 Tasten?',['Orgel','Klavier','Akkordeon'],1],
 ['Wie heißt die Währung Japans?',['Yuan','Yen','Won'],1],
 ['In welchem Land liegt Machu Picchu?',['Peru','Chile','Mexiko'],0],
 ['Wie viele Beine hat eine Spinne?',['6','8','10'],1],
 ['Wer entwickelte die Relativitätstheorie?',['Isaac Newton','Albert Einstein','Niels Bohr'],1],
 ['In welcher Stadt steht der Eiffelturm?',['Lyon','Paris','Marseille'],1],
 ['Wie viele Stunden hat eine Woche?',['148','168','186'],1],
 ['Welche Farbe entsteht aus Blau und Gelb?',['Grün','Lila','Orange'],0],
 ['Welche Stadt war Gastgeber der Olympischen Sommerspiele 2008?',['Tokio','Peking','Seoul'],1],
];
const QBANK_HARD=[
 ['In welchem Jahr wurde die Bundesrepublik Deutschland gegründet?',['1949','1945','1955'],0],
 ['Wer schrieb „Also sprach Zarathustra“?',['Friedrich Nietzsche','Immanuel Kant','Arthur Schopenhauer'],0],
 ['Wer schrieb die „Kritik der reinen Vernunft“?',['Immanuel Kant','Georg Wilhelm Friedrich Hegel','Johann Gottlieb Fichte'],0],
 ['Wie heißt die Hauptstadt der Mongolei?',['Ulaanbaatar','Astana','Bischkek'],0],
 ['Welches Element hat die Ordnungszahl 1?',['Wasserstoff','Helium','Lithium'],0],
 ['In welchem Jahr landete Apollo 11 auf dem Mond?',['1969','1967','1971'],0],
 ['Wer formulierte die Unschärferelation?',['Werner Heisenberg','Erwin Schrödinger','Niels Bohr'],0],
 ['Welche Stadt war die Hauptstadt der Tang-Dynastie?',["Chang'an",'Peking','Nanjing'],0],
 ['Wem wird „Die Kunst des Krieges“ zugeschrieben?',['Sunzi','Konfuzius','Laozi'],0],
 ['Welches Werk wird Laozi zugeschrieben?',['Daodejing','Die Gespräche (Lunyu)','Das Buch der Wandlungen'],0],
 ['Wie viele Herzen hat ein Oktopus?',['3','1','2'],0],
 ['In welchem Ozean liegt der Marianengraben?',['Pazifik','Atlantik','Indischer Ozean'],0],
 ['In welchem Jahr wurde die Bastille gestürmt?',['1789','1776','1799'],0],
 ['Wer komponierte „Die Zauberflöte“?',['Wolfgang Amadeus Mozart','Joseph Haydn','Ludwig van Beethoven'],0],
 ['Welches Land hat die meisten Zeitzonen, Überseegebiete mitgezählt?',['Frankreich','Russland','USA'],0],
 ['Wie heißt der längste Fluss Chinas?',['Jangtse','Gelber Fluss','Mekong'],0],
 ['Wer malte „Die Sternennacht“?',['Vincent van Gogh','Claude Monet','Paul Cézanne'],0],
 ['Wer schrieb „Der Process“?',['Franz Kafka','Robert Musil','Thomas Mann'],0],
 ['Welches Gas macht den größten Teil der Erdatmosphäre aus?',['Stickstoff','Sauerstoff','Argon'],0],
 ['In welcher Stadt wurde Mozart geboren?',['Salzburg','Wien','Linz'],0],
 ['Wie heißt die Hauptstadt von Neuseeland?',['Wellington','Auckland','Christchurch'],0],
 ['Welches Jahr gilt als Ende des Weströmischen Reiches?',['476','410','1453'],0],
 ['Wer begründete die Psychoanalyse?',['Sigmund Freud','Carl Gustav Jung','Alfred Adler'],0],
 ['Welche Programmiersprache entwickelte Guido van Rossum?',['Python','Ruby','Perl'],0],
 ['In welchem Jahr wurde das erste iPhone vorgestellt?',['2007','2005','2009'],0],
 ['Welches Land hat eine nicht rechteckige Nationalflagge?',['Nepal','Bhutan','Schweiz'],0],
 ['Wer schrieb „Hundert Jahre Einsamkeit“?',['Gabriel García Márquez','Jorge Luis Borges','Mario Vargas Llosa'],0],
 ['In welchem heutigen Land steht der Hadrianswall?',['Großbritannien','Deutschland','Frankreich'],0],
 ['Wofür bekam Wilhelm Conrad Röntgen 1901 den ersten Physik-Nobelpreis?',['Die Entdeckung einer neuen Strahlung','Die Entdeckung der Radioaktivität','Die Entdeckung des Elektrons'],0],
 ['Welche Stadt richtete 1972 die Olympischen Sommerspiele aus?',['München','Montreal','Moskau'],0],
 ['Welcher Fluss fließt mitten durch Shanghai?',['Huangpu','Perlfluss','Li-Fluss'],0],
 ['Wer war der erste Bundeskanzler der Bundesrepublik?',['Konrad Adenauer','Willy Brandt','Ludwig Erhard'],0],
 ['Welches Organ produziert Insulin?',['Bauchspeicheldrüse','Leber','Niere'],0],
 ['In welcher Einheit misst man den elektrischen Widerstand?',['Ohm','Volt','Ampere'],0],
 ['In welchem Jahr wurde Google gegründet?',['1998','1996','2000'],0],
 ['Was ist die kleinste Primzahl?',['2','1','3'],0],
 ['Welcher Kaiser ließ die Terrakotta-Armee anlegen?',['Qin Shi Huang','Kangxi','Han Wudi'],0],
 ['Aus welcher Pflanze wird Tequila hergestellt?',['Agave','Kaktusfeige','Zuckerrohr'],0],
 ['In welchem Jahr endete der Zweite Weltkrieg in Europa?',['1945','1944','1946'],0],
 ['Welcher Philosoph sagte „Ich denke, also bin ich“?',['René Descartes','Blaise Pascal','Baruch de Spinoza'],0],
 ['Wer schrieb „Der Steppenwolf“?',['Hermann Hesse','Thomas Mann','Erich Kästner'],0],
 ['Welche Hauptstadt liegt am höchsten über dem Meer?',['La Paz','Quito','Bogotá'],0],
 ['Welches chinesische Sternzeichen folgt auf die Ratte?',['Büffel','Tiger','Hase'],0],
 ['Wie viele Elemente hatte das Periodensystem nach der Benennung von 2016?',['118','112','124'],0],
 ['Welcher Architekt entwarf die Glaspyramide im Louvre?',['I. M. Pei','Frank Gehry','Renzo Piano'],0],
 ['Welches chemische Element hat das Symbol W?',['Wolfram','Wismut','Vanadium'],0],
 ['In welchem Jahr wurde die Volksrepublik China gegründet?',['1911','1949','1966'],1],
 ['Welche Dynastie regierte China als letzte?',['Ming','Qing','Song'],1],
 ['Welches Land hat die längste Küstenlinie der Welt?',['Kanada','Indonesien','Russland'],0],
 ['Welcher Fluss ist der längste Europas?',['Donau','Wolga','Dnepr'],1],
 ['Welches Organ produziert Insulin?',['Leber','Bauchspeicheldrüse','Milz'],1],
 ['Wer schrieb „Der Wohlstand der Nationen“?',['David Ricardo','Adam Smith','John Stuart Mill'],1],
 ['Welcher Vertrag begründete 1992 die Europäische Union?',['Vertrag von Lissabon','Vertrag von Maastricht','Römische Verträge'],1],
 ['Wie heißt der längste Fluss Chinas?',['Gelber Fluss','Jangtse','Perlfluss'],1],
 ['Welches Land führte 1893 als erstes das Frauenwahlrecht ein?',['Finnland','Neuseeland','Norwegen'],1],
 ['Wer entdeckte das Penicillin?',['Louis Pasteur','Alexander Fleming','Robert Koch'],1],
 ['Wie viele Zeitzonen hat China offiziell?',['Eine','Drei','Fünf'],0],
 ['Welcher Kontinent hat die meisten Staaten?',['Asien','Afrika','Europa'],1],
 ['Wer gilt als Begründer der Psychoanalyse?',['Carl Gustav Jung','Sigmund Freud','Alfred Adler'],1],
 ['In welchem Jahr wurde der Euro als Bargeld eingeführt?',['1999','2002','2004'],1],
 ['In welcher chinesischen Stadt haben Huawei und Tencent ihren Hauptsitz?',['Hangzhou','Shenzhen','Chengdu'],1],
 ['Welcher Philosoph war Lehrer von Alexander dem Großen?',['Platon','Aristoteles','Diogenes'],1],
 ['Wie viele Sinfonien vollendete Beethoven?',['7','9','12'],1],
 ['Welche Einheit misst den elektrischen Widerstand?',['Volt','Ohm','Farad'],1],
 ['Wer malte die Decke der Sixtinischen Kapelle?',['Raffael','Michelangelo','Botticelli'],1],
 ['In welchem heutigen Land liegt Timbuktu?',['Niger','Mali','Tschad'],1],
 ['Wer schrieb „Kritik der reinen Vernunft“?',['Georg Wilhelm Friedrich Hegel','Immanuel Kant','Arthur Schopenhauer'],1],
 ['Wer schrieb „Also sprach Zarathustra“?',['Friedrich Nietzsche','Martin Heidegger','Arthur Schopenhauer'],0],
 ['Welches Gas macht den größten Teil der Erdatmosphäre aus?',['Sauerstoff','Stickstoff','Kohlendioxid'],1],
 ['Welche Stadt war Hauptstadt des Byzantinischen Reichs?',['Athen','Konstantinopel','Alexandria'],1],
 ['In welchem Jahr trat China der Welthandelsorganisation bei?',['1995','2001','2008'],1],
 ['Welches ist das häufigste Element im Universum?',['Helium','Wasserstoff','Sauerstoff'],1],
 ['Wie heißt das traditionelle chinesische Rechenbrett?',['Suanpan','Soroban','Guzheng'],0],
 ['Welcher Ökonom prägte den Begriff „schöpferische Zerstörung“?',['John Maynard Keynes','Joseph Schumpeter','Milton Friedman'],1],
 ['Welches Metall ist bei Raumtemperatur flüssig?',['Quecksilber','Zinn','Blei'],0],
 ['Welche Schrift entstand im 15. Jahrhundert unter König Sejong?',['Hangul','Katakana','Devanagari'],0],
 ['Wer formulierte die Gesetze der Planetenbewegung?',['Johannes Kepler','Galileo Galilei','Tycho Brahe'],0],
 ['In welcher Stadt wurde 1919 das Bauhaus gegründet?',['Dessau','Weimar','Berlin'],1],
 ['Welcher Staat ist der flächenmäßig kleinste der Welt?',['Monaco','Vatikanstadt','San Marino'],1],
 ['Welche Politik leitete Deng Xiaoping Ende 1978 ein?',['Reform und Öffnung','Großer Sprung nach vorn','Hundert-Blumen-Bewegung'],0],
 ['Welcher französische König widerrief 1685 das Edikt von Nantes?',['Ludwig XIII.','Ludwig XIV.','Ludwig XVI.'],1],
];
const Q_LEVELS={leicht:'Leicht',mittel:'Mittel',schwer:'Schwer'};
const Q_LEVEL_TEXT={
 leicht:'leicht. Fragen, die die meisten Erwachsenen ohne Spezialwissen beantworten können.',
 mittel:'mittel. Für Leute mit gutem Allgemeinwissen. Keine Fragen, die fast jeder sofort weiß. Man soll kurz nachdenken müssen.',
 schwer:'schwer. Für Leute, die sich mit dem Thema richtig gut auskennen. Keine Fragen, die man mit Allgemeinwissen, Schulwissen oder Raten beantworten kann. Frag nach konkreten Details: Jahreszahlen, Namen, Zahlen, Orten, Zusammenhängen und weniger bekannten Fakten. Zum Maßstab: „Wie heißt die Hauptstadt von Frankreich?“ wäre viel zu leicht, „Welcher französische König widerrief das Edikt von Nantes?“ hat das richtige Niveau. Wenn du dir bei einem Fakt nicht sicher bist, nimm einen anderen, aber werde nicht leichter.',
};
let quizLevel='schwer'; try{const l=localStorage.getItem('garden-quiz-level');if(Q_LEVELS[l])quizLevel=l;}catch(e){}
const askedQs=(()=>{try{const a=JSON.parse(localStorage.getItem('garden-quiz-asked')||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string').slice(-80):[];}catch(e){return [];}})();
function qHash(t){let h=5381;t=String(t);for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return (h>>>0).toString(36).slice(-6);}
const quizSeen=(()=>{try{const a=JSON.parse(localStorage.getItem('garden-quiz-seen')||'[]');return Array.isArray(a)?a.filter(x=>typeof x==='string'&&x.length<=6).slice(-300):[];}catch(e){return [];}})();
function markSeen(q){if(!q)return;const h=qHash(q);if(quizSeen[quizSeen.length-1]===h||quizSeen.includes(h))return;quizSeen.push(h);if(quizSeen.length>300)quizSeen.splice(0,quizSeen.length-300);try{localStorage.setItem('garden-quiz-seen',JSON.stringify(quizSeen));}catch(e){}}
function rememberAsked(){try{localStorage.setItem('garden-quiz-asked',JSON.stringify(askedQs.slice(-80)));}catch(e){}}
const Q_TOPICS=['Philosophie','China','Robotik','Künstliche Intelligenz','München','Startups','Kunstgeschichte','Weltraum','Chinesische Küche','Psychologie','Bücher und Autoren','2000er Musik','Filme','Mode und Design','Architektur','Erfindungen','Antikes Griechenland','Japan','Tiere','Ozeane','Kaffee und Tee','Wirtschaft','Sprachen','Mythologie','Olympische Spiele','Pflanzen und Gärten','Deutsche Geschichte','Weltreligionen','Klassische Musik','Mathematik','Medizin','Videospiele','Seidenstraße','Berühmte Frauen','Farben','Schokolade','Reisen in Europa','Internet-Geschichte','Pixel Art','Chinesische Philosophie'];
let qTopicPick=[],qTopicAt=0,qTopicBusy=false,qTopicSeen=[];
function pickTopics(force){
  if(!qTopicPick.length)qTopicPick=shuffled(Q_TOPICS).slice(0,5);
  const f=window.__quiz&&window.__quiz.topics;if(!f||qTopicBusy)return;
  if(!force&&Date.now()-qTopicAt<600000)return;
  qTopicBusy=true;qTopicAt=Date.now();
  f({avoid:qTopicSeen.slice(-24)}).then(r=>{qTopicBusy=false;const t=r&&Array.isArray(r.topics)?r.topics.filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim().slice(0,28)).slice(0,6):[];
    if(t.length>=3){qTopicPick=t;t.forEach(x=>qTopicSeen.push(x));if(quizM.classList.contains('show'))renderQuiz();}
    else if(force){qTopicPick=shuffled(Q_TOPICS).slice(0,5);if(quizM.classList.contains('show'))renderQuiz();}}).catch(()=>{qTopicBusy=false;});
}
// topics people in the room suggested for this show
function quizSuggestions(st){
  const out=[];if(!st||!room)return out;const seen=new Set();
  roomPeers().forEach(p=>{if(p.isMe||!p.presence||p.presence.s!=='h')return;const q=p.presence.qt;if(!q||q.id!==st.id)return;const t=str(q.t,40).trim();if(!t||seen.has(t.toLowerCase()))return;seen.add(t.toLowerCase());out.push({t,n:str(p.presence.n,14)||'Friend'});});
  return out.slice(0,6);
}
let mySugg='';function suggestTopic(st,t){t=String(t||'').trim().slice(0,40);if(!t||!st)return;mySugg=t;if(room)room.presence({qt:{id:st.id,t}}).catch(()=>{});renderQuiz();}
function quizPrompt(topic,level){
  const avoid=askedQs.slice(-24);
  return `Du schreibst Fragen für eine Quiz-Show unter Freunden. Sprache: Deutsch.
Thema: ${topic?'"'+topic+'"':'gemischtes Allgemeinwissen aus möglichst verschiedenen Gebieten (Geschichte, Naturwissenschaft, Geografie, Kultur, Wirtschaft, Technik)'}
Schwierigkeit: ${Q_LEVEL_TEXT[level]||Q_LEVEL_TEXT.schwer}

Regeln:
- Genau ${Q_COUNT} Fragen, jede mit genau 3 kurzen Antwortmöglichkeiten. Genau eine ist richtig.
- Die falschen Antworten müssen plausibel sein und zur selben Kategorie gehören wie die richtige (zum Beispiel drei Jahreszahlen, drei Personen oder drei Städte). Keine Scherzantworten.
- Die Frage darf die richtige Antwort nicht verraten.
- Decke verschiedene Seiten des Themas ab.
- Nur gesicherte, eindeutige Fakten. Nichts Umstrittenes und nichts, was sich laufend ändert (aktuelle Rekorde, Amtsinhaber, Preise).
- Fragen höchstens 140 Zeichen, Antworten höchstens 40 Zeichen.
${avoid.length?'- Diese Fragen gab es schon, stelle andere: '+avoid.join(' / ')+'\n':''}
Antworte nur mit JSON, ohne Markdown und ohne Erklärung:
[{"q":"Frage","o":["A","B","C"],"a":0}]
"a" ist der Index (0, 1 oder 2) der richtigen Antwort.`;
}
const Q_TIME=15000, Q_REVEAL=4200, Q_COUNT=8;
const quizM=document.getElementById('quizM'), qJoin=document.getElementById('qJoin');
let hostState=null, quizJoined=null, myAns=null, qLastPub='', qLastPubT=0, qGenBusy=false, qGenErr='', qBackTopic='';
function myPeer(){try{const m=room&&room.peers().find(p=>p.isMe&&p.sameTab);return m?m.peer:'me';}catch(e){return 'me';}}
function quizRank(id,ph,key){const t=parseInt(String(id).slice(1),36)||0;return [ph&&ph!=='lobby'?0:1,t,String(key)];}
function rankLess(a,b){for(let i=0;i<3;i++){if(a[i]<b[i])return true;if(a[i]>b[i])return false;}return false;}
function quizHost(){
  if(!room) return {self:true};
  let best=null;
  if(hostState) best={self:true,r:quizRank(hostState.id,hostState.ph,myPeer())};
  roomPeers().forEach(p=>{if(p.isMe||p.kind!=='viewer'||!p.presence||p.presence.s!=='h')return;const q=cleanQS(p.presence.qs);if(!q)return;
    const r=quizRank(q.id,q.ph,p.peer);if(!best||rankLess(r,best.r))best={peer:p,r};});
  return best&&best.peer?{peer:best.peer}:{self:true};
}
function cleanQS(q){
  if(!q||typeof q!=='object'||typeof q.id!=='string') return null;
  const o=Array.isArray(q.o)?q.o.slice(0,3).map(x=>str(x,80)):[];
  const sc={};if(q.sc&&typeof q.sc==='object')Object.entries(q.sc).slice(0,12).forEach(([k,v])=>{if(Number.isFinite(v))sc[str(k,40)]=Math.round(v);});
  return {id:str(q.id,24),ph:['lobby','q','reveal','end','gen'].includes(q.ph)?q.ph:'lobby',qi:Math.round(num(q.qi,0)),n:Math.round(num(q.n,0)),q:str(q.q,220),o,a:Number.isInteger(q.a)?q.a:-1,left:clamp(Math.round(num(q.left,0)),0,30),sc,topic:str(q.topic,40),host:str(q.host,14)};
}
function pubState(){
  const H=hostState; if(!H) return null; const cur=H.qs[H.qi]||null;
  return {id:H.id,ph:H.ph,qi:H.qi,n:H.qs.length,q:cur&&H.ph!=='lobby'&&H.ph!=='gen'?cur[0]:'',o:cur&&H.ph!=='lobby'&&H.ph!=='gen'?cur[1]:[],a:(H.ph==='reveal'||H.ph==='end')&&cur?cur[2]:-1,left:H.left||0,sc:H.sc,topic:H.topic||'',host:(me().name||'Host').slice(0,14)};
}
function quizState(){const h=quizHost();if(h.self)return hostState?pubState():null;const q=h.peer.presence&&h.peer.presence.qs;return q?cleanQS(q):null;}
function quizPlayers(st){
  const list=[]; if(!st) return list;
  if(quizJoined===st.id) list.push({peer:myPeer(),name:me().name||'Me',look:me().look,ans:myAns&&myAns.id===st.id?myAns:null,me:true});
  if(room){const ps=roomPeers();
    ps.forEach(p=>{if(p.isMe||p.kind!=='viewer'||!p.presence||p.presence.s!=='h')return;const z=p.presence.qz;if(!z||z.id!==st.id)return;
      list.push({peer:p.peer,name:str(p.presence.n,14)||'Friend',look:cleanLook(p.presence.l),ans:Number.isInteger(z.qi)?{qi:z.qi,c:z.c,t:num(z.t,0)}:null});});}
  return list.slice(0,6);
}
function shuffled(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function mixQ([q,o,a]){const idx=shuffled([0,1,2]);return [q,idx.map(i=>o[i]),idx.indexOf(a)];}
function bankQuestions(level){
  const pool=level==='leicht'?QBANK:level==='schwer'?QBANK_HARD:QBANK.concat(QBANK_HARD);
  // fewest people in the room have seen it first; random among equals
  const seenSets=[new Set(quizSeen.concat(askedQs.map(qHash)))];
  if(room)roomPeers().forEach(p=>{if(p.isMe||!p.presence||p.presence.s!=='h')return;const a=p.presence.qh;if(Array.isArray(a))seenSets.push(new Set(a.filter(x=>typeof x==='string').slice(-300)));});
  const scored=shuffled(pool).map(x=>{const h=qHash(x[0]);return {x,n:seenSets.reduce((k,S)=>k+(S.has(h)?1:0),0)};});
  scored.sort((a,b)=>a.n-b.n);
  return scored.slice(0,Q_COUNT).map(o=>mixQ(o.x));
}
function newHost(){hostState={id:'q'+Date.now().toString(36),ph:'lobby',qi:0,qs:[],sc:{},left:0,ends:0,topic:''};joinQuiz(hostState.id);}
function joinQuiz(id){if(quizJoined!==id)mySugg='';quizJoined=id;myAns=null;if(room)room.presence({qz:{id},qh:quizSeen.slice(-150)}).catch(()=>{});}
function leaveQuiz(){quizJoined=null;myAns=null;if(room)room.presence({qz:null}).catch(()=>{});}
async function startQuiz(topic){
  const H=hostState; if(!H||H.ph!=='lobby') return;
  H.topic=topic||''; H.sc={}; H.qi=0; qGenErr='';
  const level=quizLevel, sample=await getSample();
  if(hostState!==H||H.ph!=='lobby') return;
  let qs=null;
  const make=window.__quiz&&window.__quiz.make;
  if(make||sample){
    H.ph='gen'; renderQuiz();
    const ac=new AbortController(), to=setTimeout(()=>ac.abort(),45000);
    try{
      let arr=[];
      if(make){const r=await make({topic:H.topic,level,avoid:askedQs.slice(-30),n:Q_COUNT});if(r&&r.error)throw new Error(r.error);arr=r&&Array.isArray(r.qs)?r.qs:[];}
      else{const r=await sample(quizPrompt(H.topic,level),{modelTier:'default',cache:false,signal:ac.signal});
        const m=String(r&&r.text||'').match(/\[[\s\S]*\]/); arr=m?JSON.parse(m[0]):[];}
      const ok=x=>x&&typeof x.q==='string'&&x.q.trim()&&Array.isArray(x.o)&&x.o.length===3
        &&x.o.every(v=>(typeof v==='string'||typeof v==='number')&&String(v).trim())
        &&new Set(x.o.map(v=>String(v).trim().toLowerCase())).size===3&&Number.isInteger(x.a)&&x.a>=0&&x.a<3;
      qs=(Array.isArray(arr)?arr:[]).filter(ok).slice(0,Q_COUNT).map(x=>mixQ([x.q.trim().slice(0,200),x.o.map(v=>String(v).trim().slice(0,60)),x.a]));
      if(qs.length<4){qs=null;qGenErr='Zum Thema kamen keine passenden Fragen.';}
    }catch(e){qs=null;const m=String(e&&e.message||'');
      qGenErr=m==='off'?'Fragen zum Thema gehen erst, wenn die KI eingerichtet ist.':m==='limit'?'Für heute sind alle Themen-Quizze aufgebraucht.':'Die KI hat gerade nicht geantwortet.';}
    clearTimeout(to);
  }
  if(hostState!==H) return;
  // a chosen topic never turns into random questions without asking: back to the lobby
  if(!qs&&H.topic){qGenErr+=` Nochmal ▶ Start für „${H.topic}“, oder gemischte Fragen spielen.`;qBackTopic=H.topic;H.ph='lobby';renderQuiz();return;}
  if(!qs){qs=bankQuestions(level);H.topic='';}
  H.qs=qs; qs.forEach(q=>askedQs.push(q[0])); if(askedQs.length>80)askedQs.splice(0,askedQs.length-80); rememberAsked();
  H.ph='q'; H.ends=Date.now()+Q_TIME; H.left=Q_TIME/1000; myAns=null; renderQuiz();
}
function hostTick(){
  if(hostState&&hostState.ph==='lobby'){const h=quizHost();if(!h.self){hostState=null;if(room)room.presence({qs:null}).catch(()=>{});const st=quizState();if(st&&quizM.classList.contains('show'))joinQuiz(st.id);renderQuiz();return;}}
  const H=hostState; if(!H) return; const now=Date.now();
  if(H.ph==='q'){
    H.left=Math.max(0,Math.ceil((H.ends-now)/1000));
    const ps=quizPlayers(pubState()), done=ps.filter(p=>p.ans&&p.ans.qi===H.qi);
    if(now>=H.ends||(ps.length&&done.length===ps.length)){
      done.forEach(p=>{if(p.ans.c===H.qs[H.qi][2])H.sc[p.peer]=(H.sc[p.peer]||0)+100+10*clamp(Math.round(p.ans.t||0),0,15);});
      ps.forEach(p=>{if(!(p.peer in H.sc))H.sc[p.peer]=0;});
      H.ph='reveal'; H.ends=now+Q_REVEAL;
    }
  } else if(H.ph==='reveal'&&now>=H.ends){
    if(H.qi+1<H.qs.length){H.qi++;H.ph='q';H.ends=now+Q_TIME;H.left=Q_TIME/1000;} else H.ph='end';
  }
  if(room){const st=pubState(),k=JSON.stringify(st);if(k!==qLastPub||now-qLastPubT>3000){qLastPub=k;qLastPubT=now;room.presence({qs:st}).catch(()=>{});}}
}
function answer(c){
  const st=quizState(); if(!st||st.ph!=='q'||quizJoined!==st.id) return;
  if(myAns&&myAns.id===st.id&&myAns.qi===st.qi) return;
  myAns={id:st.id,qi:st.qi,c,t:st.left}; if(room)room.presence({qz:{id:st.id,qi:st.qi,c,t:st.left}}).catch(()=>{});
  renderQuiz();
}
function openQuiz(){
  const h=quizHost(), st=quizState();
  if(h.self&&!hostState&&!(st&&st.ph!=='lobby')) newHost();
  else if(st&&quizJoined!==st.id) joinQuiz(st.id);
  quizM.classList.add('show'); renderQuiz();
}
function closeQuiz(){
  quizM.classList.remove('show'); leaveQuiz();
  if(hostState){hostState=null;if(room)room.presence({qs:null}).catch(()=>{});}
}
document.getElementById('qClose').onclick=closeQuiz;
qJoin.onclick=()=>{qJoin.hidden=true;openQuiz();};
const askM=document.getElementById('askM');
/* ---------- Vier gewinnt ----------
   One game per cottage. Whoever opens it first hosts (a running game beats a waiting one, then the oldest),
   the host keeps the board and publishes it; the second player sends moves, everyone else watches.
   Alone? Play against the computer. */
const c4M=document.getElementById('c4M'),c4JoinB=document.getElementById('c4Join');
const C4W=7,C4H=6;
let c4H=null, c4Mine=null, c4LastPub='', c4LastPubT=0, c4Seen={}, c4Drop=-1, c4BotAt=0, c4ReqN=0;
function c4Rank(id,ph,key){const t=parseInt(String(id).slice(1),36)||0;return [ph==='wait'?1:0,t,String(key)];}
function c4Leader(){
  if(!room) return {self:true};
  let best=null;
  if(c4H) best={self:true,r:c4Rank(c4H.id,c4H.ph,myPeer())};
  roomPeers().forEach(p=>{if(p.isMe||p.kind!=='viewer'||!p.presence||p.presence.s!=='h')return;const q=c4Clean(p.presence.c4);if(!q)return;
    const r=c4Rank(q.id,q.ph,p.peer);if(!best||rankLess(r,best.r))best={peer:p,r};});
  return best&&best.peer?{peer:best.peer}:{self:true};
}
function c4Clean(q){
  if(!q||typeof q!=='object'||typeof q.id!=='string'||!/^c[0-9a-z]{4,12}$/.test(q.id))return null;
  if(typeof q.b!=='string'||!/^[012]{42}$/.test(q.b))return null;
  const pl=x=>Array.isArray(x)&&typeof x[0]==='string'?[x[0].slice(0,80),str(x[1],14)||'Friend']:null;
  return {id:q.id,b:q.b,t:q.t===2?2:1,p1:pl(q.p1)||['?','?'],p2:pl(q.p2),ph:['wait','play','end'].includes(q.ph)?q.ph:'wait',
    w:[0,1,2,3].includes(q.w)?q.w:0,l:Array.isArray(q.l)?q.l.filter(i=>Number.isInteger(i)&&i>=0&&i<42).slice(0,7):[],last:Number.isInteger(q.last)?q.last:-1,mv:num(q.mv,0),rd:num(q.rd,0),bot:!!q.bot};
}
function c4Pub(){const H=c4H;return {id:H.id,b:H.b.join(''),t:H.t,p1:H.p1,p2:H.p2,ph:H.ph,w:H.w,l:H.l,last:H.last,mv:H.mv,rd:H.rd,bot:H.bot};}
function c4State(){const L=c4Leader();if(L.self)return c4H?c4Clean(c4Pub()):null;return c4Clean(L.peer.presence.c4);}
function c4New(){c4H={id:'c'+Date.now().toString(36),b:Array(42).fill(0),t:1,p1:[myPeer(),(me().name||'Me').slice(0,14)],p2:null,ph:'wait',w:0,l:[],last:-1,mv:0,rd:0,bot:false,start:1};c4Seen={};}
function c4Lines(b,i){
  const r=Math.floor(i/C4W),c=i%C4W,v=b[i];if(!v)return null;
  for(const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]){
    const L=[i];
    for(const s of [1,-1]){let rr=r+dr*s,cc=c+dc*s;while(rr>=0&&rr<C4H&&cc>=0&&cc<C4W&&b[rr*C4W+cc]===v){L.push(rr*C4W+cc);rr+=dr*s;cc+=dc*s;}}
    if(L.length>=4)return L;
  }
  return null;
}
function c4Free(b,c){for(let r=C4H-1;r>=0;r--)if(!b[r*C4W+c])return r*C4W+c;return -1;}
function c4Play(c){
  const H=c4H;if(!H||H.ph!=='play'||c<0||c>=C4W)return false;
  const i=c4Free(H.b,c);if(i<0)return false;
  H.b[i]=H.t;H.last=i;H.mv++;
  const L=c4Lines(H.b,i);
  if(L){H.ph='end';H.w=H.t;H.l=L;}
  else if(H.b.every(x=>x)){H.ph='end';H.w=3;}
  else H.t=H.t===1?2:1;
  return true;
}
function c4BotMove(b){
  // win if possible, else block, else avoid giving a win away, prefer the middle
  const free=[...Array(C4W).keys()].filter(c=>c4Free(b,c)>=0);
  const tryWin=v=>{for(const c of free){const i=c4Free(b,c);b[i]=v;const w=c4Lines(b,i);b[i]=0;if(w)return c;}return -1;};
  let c=tryWin(2);if(c>=0)return c;c=tryWin(1);if(c>=0)return c;
  const safe=free.filter(c=>{const i=c4Free(b,c);b[i]=2;const above=i-C4W;let bad=false;if(above>=0){b[above]=1;bad=!!c4Lines(b,above);b[above]=0;}b[i]=0;return !bad;});
  const pool=safe.length?safe:free;const pref=[3,2,4,1,5,0,6];
  const top=pool.slice().sort((a,b)=>pref.indexOf(a)-pref.indexOf(b));
  return Math.random()<.75?top[0]:top[Math.floor(Math.random()*Math.min(3,top.length))];
}
function c4Peers(){return room?roomPeers().filter(p=>!p.isMe&&p.kind==='viewer'&&p.presence&&p.presence.s==='h'):[];}
function c4Tick(){
  // someone else's game wins while mine is still waiting: drop mine and watch or join theirs
  if(c4H&&c4H.ph==='wait'&&!c4H.p2){const L=c4Leader();if(!L.self){c4H=null;if(room)room.presence({c4:null}).catch(()=>{});}}
  const H=c4H;
  if(H){
    const now=Date.now(), ps=c4Peers();
    if(H.p2&&!H.bot&&!ps.some(p=>p.peer===H.p2[0])){H.p2=null;if(H.ph==='play'){H.ph='wait';}}
    if(H.ph==='wait'&&!H.p2){const j=ps.find(p=>p.presence.c4j&&p.presence.c4j.id===H.id);
      if(j){H.p2=[j.peer,str(j.presence.n,14)||'Friend'];H.bot=false;c4Reset(true);}}
    if(H.ph==='play'&&H.t===2&&H.p2&&!H.bot){const p=ps.find(x=>x.peer===H.p2[0]);const m=p&&p.presence.c4m;
      if(m&&m.id===H.id&&m.rd===H.rd&&m.n===H.mv&&Number.isInteger(m.c)){if(c4Play(m.c))Sfx.click();}}
    if(H.ph==='play'&&H.t===2&&H.bot){if(!c4BotAt)c4BotAt=now+650;if(now>=c4BotAt){c4BotAt=0;c4Play(c4BotMove(H.b.slice()));Sfx.click();}}
    if(H.ph==='end'&&H.p2&&!H.bot){const p=ps.find(x=>x.peer===H.p2[0]);const r=p&&p.presence.c4r;if(r&&r.id===H.id&&r.n===H.rd+1)c4Reset();}
    if(room){const st=c4Pub(),k=JSON.stringify(st);if(k!==c4LastPub||now-c4LastPubT>3000){c4LastPub=k;c4LastPubT=now;room.presence({c4:st}).catch(()=>{});}}
  }
  if(c4M.classList.contains('show'))renderC4();
  const L=c4Leader(),st=L.self?null:c4State();
  const showJ=!!(st&&st.ph==='wait'&&!st.p2&&!c4M.classList.contains('show')&&scene==='house');
  if(c4JoinB.hidden===showJ)c4JoinB.hidden=!showJ;
  if(showJ){const tx=`Vier gewinnt mit ${st.p1[1]}: mitspielen`;if(c4JoinB.textContent!==tx)c4JoinB.textContent=tx;}
}
function c4Reset(first){const H=c4H;if(!H)return;H.b=Array(42).fill(0);H.ph=H.p2?'play':'wait';H.w=0;H.l=[];H.last=-1;H.mv=0;if(!first){H.rd++;H.start=H.start===1?2:1;}H.t=H.start;c4BotAt=0;c4Seen={};}
function c4MyRole(st){if(!st)return 0;if(st.p1[0]===myPeer())return 1;if(st.p2&&st.p2[0]===myPeer())return 2;return 0;}
function c4Move(c){
  const st=c4State();if(!st||st.ph!=='play')return;
  const role=c4MyRole(st);if(!role||st.t!==role)return;
  if(c4H&&c4Leader().self){if(c4Play(c)){Sfx.click();renderC4();}return;}
  if(c4Free(st.b.split('').map(Number),c)<0)return;
  if(room)room.presence({c4m:{id:st.id,rd:st.rd,n:st.mv,c}}).catch(()=>{});
}
function openC4(){
  const L=c4Leader(),st=c4State();
  if(L.self&&!c4H)c4New();
  else if(st&&st.ph==='wait'&&!st.p2&&!L.self&&room)room.presence({c4j:{id:st.id}}).catch(()=>{});
  c4M.classList.add('show');renderC4();
}
function closeC4(){
  c4M.classList.remove('show');
  if(room)room.presence({c4j:null,c4m:null,c4r:null}).catch(()=>{});
  if(c4H){c4H=null;if(room)room.presence({c4:null}).catch(()=>{});}
}
document.getElementById('c4Close').onclick=closeC4;
c4JoinB.onclick=()=>{c4JoinB.hidden=true;openC4();};
document.addEventListener('keydown',e=>{if(!c4M.classList.contains('show'))return;const n=parseInt(e.key,10);if(n>=1&&n<=7){e.preventDefault();c4Move(n-1);}},true);
function renderC4(){
  const st=c4State(),L=c4Leader(),who=document.getElementById('c4Who'),stE=document.getElementById('c4St'),B=document.getElementById('c4B'),row=document.getElementById('c4Row');
  if(!st){
    if(L.self&&!c4H){c4New();return renderC4();}
    stE.textContent='Das Spiel wurde beendet.';who.innerHTML='';B.innerHTML='';row.innerHTML='';return;
  }
  const role=c4MyRole(st), isHost=!!c4H&&L.self;
  const nm=(p,me)=>p?(p[0]===myPeer()?'Du':p[1]):'…';
  const whoK=[st.id,st.t,st.ph,nm(st.p1),nm(st.p2)].join('|');
  if(who.dataset.k!==whoK){who.dataset.k=whoK;who.innerHTML='';
    [[st.p1,1,'#e8506c'],[st.p2,2,'#f2c94c']].forEach(([p,v,col])=>{const d=document.createElement('div');d.className=st.ph==='play'&&st.t===v?'on':'off';
      const b=document.createElement('b');b.style.background=col;d.appendChild(b);d.appendChild(document.createTextNode(p?nm(p):'wartet …'));who.appendChild(d);});}
  let msg='';
  if(st.ph==='wait')msg=isHost?'Warte auf jemanden im Haus, oder spiel gegen den Computer.':(role===2?'Gleich geht’s los …':`${st.p1[1]} sucht jemanden.`);
  else if(st.ph==='play')msg=role===st.t?'Du bist dran.':`${nm(st.t===1?st.p1:st.p2)} ist dran.`;
  else msg=st.w===3?'Unentschieden.':(role===st.w?'Du hast gewonnen!':`${nm(st.w===1?st.p1:st.p2)} gewinnt.`);
  if(stE.textContent!==msg)stE.textContent=msg;
  if(st.ph==='end'&&!c4Seen['w'+st.id+st.rd]){c4Seen['w'+st.id+st.rd]=1;if(role&&role===st.w)Sfx.yay();}
  // board
  const canMove=st.ph==='play'&&role===st.t;
  const bK=st.b+'|'+st.l.join(',')+'|'+(canMove?1:0)+'|'+st.last;
  if(B.dataset.k!==bK){
    const prev=B.dataset.b||'';B.dataset.k=bK;B.dataset.b=st.b;B.innerHTML='';
    for(let c=0;c<C4W;c++){const col=document.createElement('div');col.className='c4col'+(canMove&&c4Free(st.b.split('').map(Number),c)>=0?'':' no');col.setAttribute('role','button');col.setAttribute('aria-label','Spalte '+(c+1));
      col.onclick=()=>c4Move(c);
      for(let r=0;r<C4H;r++){const i=r*C4W+c,v=st.b[i];const d=document.createElement('div');d.className='c4c'+(v==='1'?' p1':v==='2'?' p2':'')+(st.l.includes(i)?' win':'');
        if(i===st.last&&prev&&prev[i]==='0'){d.classList.add('drop');d.style.setProperty('--r',r+1);if(!isHost||role!==st.t)try{Sfx.click();}catch(e){}}
        col.appendChild(d);}
      B.appendChild(col);}
  }
  // actions
  const rK=[st.ph,isHost?1:0,role,st.bot?1:0,st.p2?1:0,st.rd].join('|');
  if(row.dataset.k!==rK){row.dataset.k=rK;row.innerHTML='';
    const add=(t,f)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=f;row.appendChild(b);};
    if(isHost&&st.ph==='wait')add('Gegen den Computer',()=>{c4H.p2=['bot','Computer'];c4H.bot=true;c4Reset(true);renderC4();});
    if(st.ph==='end'&&role){if(isHost)add('Nochmal',()=>{c4Reset();renderC4();});else add('Nochmal',()=>{if(room)room.presence({c4r:{id:st.id,n:st.rd+1}}).catch(()=>{});});}
  }
}
setInterval(c4Tick,200);
/* ---------- "Arbeitest du noch an …?" ----------
   Like Netflix asking if you are still watching: a project nobody watered for two weeks gets one friendly question.
   At most one question a day, only in your own garden. */
const stillM=document.getElementById('stillM');let stillP=null,stillArmed=false,stillDone=false;
function lastTouch(p){const lg=(home&&home.logs&&home.logs[p.id])||[];return Math.max(p.t||0,p.last||0,lg.length?num(lg[lg.length-1].t,0):0);}
function stillCandidate(){
  if(!home||visiting||scene!=='garden'||home.askDay===ofToday())return null;
  const now=Date.now(),ask=home.ask||{};
  return home.projects.filter(p=>now-lastTouch(p)>14*864e5&&(ask[p.id]||0)<now).sort((a,b)=>lastTouch(a)-lastTouch(b))[0]||null;
}
function stillAsk(p){
  stillP=p;stillArmed=false;
  const days=Math.floor((Date.now()-lastTouch(p))/864e5);
  document.getElementById('stillT').textContent=`Arbeitest du noch an ${p.code}?`;
  document.getElementById('stillS').textContent=[p.name&&p.name!==p.code?p.name:'',`Seit ${days} Tagen nicht gegossen.`].filter(Boolean).join('. ').replace('..','.');
  document.getElementById('stillNoS').textContent='Kommt auf den Kompost und bleibt dort sichtbar';
  home.askDay=ofToday();persist();
  stillM.classList.add('show');setTimeout(()=>document.getElementById('stillYes').focus(),30);
}
function stillClose(){stillM.classList.remove('show');stillP=null;}
document.getElementById('stillYes').onclick=()=>{const p=stillP;if(!p)return;home.ask[p.id]=Date.now()+3*864e5;persist();stillClose();
  const [x,y]=posOf(p);av.target={x,y:y+10};};
document.getElementById('stillLater').onclick=()=>{const p=stillP;if(!p)return;home.ask[p.id]=Date.now()+14*864e5;persist();stillClose();toast(`Okay, ${p.code} macht Pause. Ich frag in zwei Wochen wieder.`,4000);};
document.getElementById('stillNo').onclick=()=>{const p=stillP;if(!p)return;
  if(!stillArmed){stillArmed=true;document.getElementById('stillNoS').textContent='Nochmal tippen zum Kompostieren';return;}
  {const c=JSON.parse(JSON.stringify(p));c.ct=Date.now();c.note=home.notes[p.id]||'';c.lg=(home.logs&&home.logs[p.id])||[];delete c.pos;
   home.compost=[c].concat(home.compost||[]).slice(0,30);compostFx(p.code);}
  home.projects=home.projects.filter(x=>x!==p);delete home.notes[p.id];if(home.logs)delete home.logs[p.id];delete home.ask[p.id];
  if(active===p){active=null;lastActive=undefined;dlg.classList.remove('show');}
  persist();rebuildLabels();refreshChrome();stillClose();};
(()=>{const c=document.getElementById('stillGrass').getContext('2d');c.fillStyle='#7dc46c';c.fillRect(0,4,160,8);c.fillStyle='#5aa84a';c.fillRect(0,4,160,1);
  for(let x=1;x<160;x+=3){const h=2+((x*7)%4);c.fillStyle=x%2?'#6bb35c':'#8fd17c';c.fillRect(x,6-h+2,1,h);}})();
setInterval(()=>{
  if(stillDone||document.querySelector('.modal.show')||creator.classList.contains('show')||!document.getElementById('loading').hidden)return;
  const p=stillCandidate();if(p){stillDone=true;setTimeout(()=>{if(!document.querySelector('.modal.show')&&stillCandidate()===p)stillAsk(p);else stillDone=false;},2500);}
},4000);
function askQuiz(){
  const st=quizState(),h=quizHost(),c=c4State(),L=c4Leader();
  const qS=document.getElementById('gQuizS'),cS=document.getElementById('gC4S');
  const qLive=!h.self&&st&&st.ph!=='end';
  qS.textContent=qLive?`Läuft gerade bei ${st.host}: mitmachen`:'Bis zu 6 Leute, Fragen zu jedem Thema';qS.classList.toggle('live',!!qLive);
  const cLive=!L.self&&c;
  cS.textContent=cLive?(c.ph==='wait'?`${c.p1[1]} sucht jemanden: mitspielen`:`${c.p1[1]} gegen ${c.p2?c.p2[1]:'?'}: zuschauen`):'Zu zweit oder gegen den Computer';cS.classList.toggle('live',!!cLive);
  askM.classList.add('show'); setTimeout(()=>document.getElementById(qLive||!cLive?'gQuiz':'gC4').focus(),30);
}
document.getElementById('gQuiz').onclick=()=>{askM.classList.remove('show');openQuiz();};
document.getElementById('gC4').onclick=()=>{askM.classList.remove('show');openC4();};
document.getElementById('askNo').onclick=()=>askM.classList.remove('show');
(()=>{const c=document.getElementById('askGrass').getContext('2d');c.fillStyle='#7dc46c';c.fillRect(0,4,160,8);c.fillStyle='#5aa84a';c.fillRect(0,4,160,1);
  for(let x=1;x<160;x+=3){const h=2+((x*7)%4);c.fillStyle=x%2?'#6bb35c':'#8fd17c';c.fillRect(x,6-h+2,1,h);}
  [[18,'#e85a5a'],[52,'#ffffff'],[90,'#f2c94c'],[131,'#f49ab8']].forEach(([x,col])=>{c.fillStyle=col;c.fillRect(x-1,3,3,1);c.fillRect(x,2,1,3);});})();
const qStage=document.getElementById('qStage'),qsx=qStage.getContext('2d');
function renderQuiz(){
  if(!quizM.classList.contains('show')) return;
  const st=quizState(), h=quizHost(), isHost=!!hostState&&h.self;
  if(st&&st.q&&(st.ph==='q'||st.ph==='reveal')&&quizJoined===st.id)markSeen(st.q);
  const board=document.getElementById('qBoard'),opts=document.getElementById('qOpts'),lobby=document.getElementById('qLobby'),info=document.getElementById('qInfo');
  const players=quizPlayers(st);
  // Rebuild a block only when what it shows has changed: this runs 4x a second, and
  // recreating an input or button on every tick makes typing and clicking impossible.
  const setText=(el,t)=>{if(el.textContent!==t)el.textContent=t;};
  const clearOpts=()=>{if(opts.dataset.k||opts.firstChild){opts.dataset.k='';opts.innerHTML='';}};
  const setLobby=(key,build)=>{
    if(lobby.dataset.k===key) return;
    const old=document.getElementById('qTopic'), keep=old?old.value:'', focus=!!old&&document.activeElement===old;
    lobby.dataset.k=key; lobby.innerHTML=''; build(keep,focus);
  };
  if(!st&&h.self&&!hostState){newHost();return renderQuiz();}
  if(!st){setText(board,'Die Show ist gerade geschlossen.');clearOpts();setText(info,'');setLobby('none',()=>{});drawStage(null,players);return;}
  setText(info,st.ph==='q'||st.ph==='reveal'?`FRAGE ${st.qi+1}/${st.n}, ${st.ph==='q'?'NOCH '+st.left+' S':'AUFLÖSUNG'}`:st.ph==='end'?'ENDE':'LOBBY');
  if(st.ph==='lobby'||st.ph==='gen'){
    setText(board,st.ph==='gen'?'Gleich geht’s los …':(players.length>1?`${players.length} Spieler sind bereit.`:'Warte auf Mitspieler oder spiel alleine.'));
    clearOpts();
    if(st&&st.ph==='lobby') pickTopics();
    const sugg=quizSuggestions(st);
    setLobby(['L',st.id,st.ph,isHost?1:0,qGenErr,isHost?quizLevel:st.host,qTopicPick.join(','),sugg.map(x=>x.t+'/'+x.n).join(','),mySugg].join('|'),(keep,focus)=>{
      if(isHost&&st.ph==='lobby'){
        const row=document.createElement('div');row.className='row';
        const inp=document.createElement('input');inp.className='inp';inp.id='qTopic';inp.maxLength=80;inp.autocomplete='off';inp.placeholder=sugg.length?'Thema (sonst die Vorschläge)':'Thema (optional)';inp.value=keep||qBackTopic;qBackTopic='';
        const go=document.createElement('button');go.className='btn dark';go.type='button';go.textContent='▶ Start';
        go.onclick=()=>{let t=inp.value.trim();if(!t&&sugg.length)t=sugg.slice(0,3).map(x=>x.t).join(', ');startQuiz(t.slice(0,80));};
        inp.addEventListener('keydown',e=>{if(e.key==='Enter')go.click();});
        row.appendChild(inp);row.appendChild(go);lobby.appendChild(row);
        const ch=document.createElement('div');ch.className='qchips';
        if(sugg.length){const sl=document.createElement('div');sl.className='qsugg';sl.textContent='Vorschläge: ';
          sugg.forEach(x=>{const b=document.createElement('button');b.type='button';b.textContent=`${x.t} (${x.n})`;b.onclick=()=>{const cur=inp.value.split(',').map(v=>v.trim()).filter(Boolean);if(!cur.includes(x.t))cur.push(x.t);inp.value=cur.slice(-3).join(', ');inp.focus();};sl.appendChild(b);});
          lobby.appendChild(sl);}
        qTopicPick.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>{inp.value=t;inp.focus();};ch.appendChild(b);});
        const more=document.createElement('button');more.type='button';more.className='more';more.textContent='↻';more.setAttribute('aria-label','Andere Themen');more.onclick=()=>{pickTopics(true);renderQuiz();};ch.appendChild(more);
        lobby.appendChild(ch);
        const lv=document.createElement('div');lv.className='row qlvl';const lab=document.createElement('span');lab.textContent='NIVEAU';lv.appendChild(lab);
        Object.entries(Q_LEVELS).forEach(([k,label])=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-pressed',k===quizLevel?'true':'false');if(k===quizLevel)b.classList.add('on');
          b.onclick=()=>{quizLevel=k;try{localStorage.setItem('garden-quiz-level',k);}catch(e){}renderQuiz();};lv.appendChild(b);});
        lobby.appendChild(lv);

        if(focus) inp.focus();
      } else if(!isHost){const w=document.createElement('div');w.textContent=st.ph==='gen'?'Die KI schreibt gerade neue Fragen …':`${st.host} startet gleich die Show.`;lobby.appendChild(w);
        if(st.ph==='lobby'&&quizJoined===st.id){
          const row=document.createElement('div');row.className='row';
          const inp=document.createElement('input');inp.className='inp';inp.maxLength=40;inp.autocomplete='off';inp.placeholder='Thema vorschlagen';inp.value=keep;
          const go=document.createElement('button');go.className='btn dark';go.type='button';go.textContent='Vorschlagen';go.onclick=()=>{suggestTopic(st,inp.value);};
          inp.addEventListener('keydown',e=>{if(e.key==='Enter')go.click();});
          row.appendChild(inp);row.appendChild(go);lobby.appendChild(row);
          const ch=document.createElement('div');ch.className='qchips';
          qTopicPick.forEach(t=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=()=>suggestTopic(st,t);ch.appendChild(b);});
          lobby.appendChild(ch);
          const all=sugg.map(x=>x.t);if(mySugg&&!all.includes(mySugg))all.unshift(mySugg);
          if(all.length){const sl=document.createElement('div');sl.className='qsugg';sl.textContent='Vorschläge: '+all.join(', ');lobby.appendChild(sl);}
          if(mySugg){const m=document.createElement('div');m.className='qsugg';m.textContent=`Dein Vorschlag „${mySugg}“ ist bei ${st.host}.`;lobby.appendChild(m);}
          if(focus)inp.focus();
        }}
      if(qGenErr&&isHost){const e=document.createElement('div');e.textContent=qGenErr;lobby.appendChild(e);
        if(st.ph==='lobby'){const mx=document.createElement('div');mx.className='qchips';const b=document.createElement('button');b.type='button';b.textContent='Gemischte Fragen spielen';b.onclick=()=>startQuiz('');mx.appendChild(b);lobby.appendChild(mx);}}
    });
  } else if(st.ph==='end'){
    setText(board,'Die Show ist vorbei!');clearOpts();
    const ranked=players.slice().sort((a,b)=>(st.sc[b.peer]||0)-(st.sc[a.peer]||0));
    setLobby(['E',st.id,isHost?1:0,ranked.map(p=>p.peer+':'+p.name+':'+(st.sc[p.peer]||0)).join(',')].join('|'),()=>{
      const rank=document.createElement('div');rank.className='qrank';
      ranked.forEach((p,i)=>{const r=document.createElement('div');const n=document.createElement('span');n.textContent=['🥇','🥈','🥉'][i]?(['🥇','🥈','🥉'][i]+' '+p.name):(i+1)+'. '+p.name;const sc=document.createElement('span');sc.textContent=(st.sc[p.peer]||0)+' Punkte';r.appendChild(n);r.appendChild(sc);rank.appendChild(r);});
      lobby.appendChild(rank);
      if(isHost){const again=document.createElement('button');again.className='btn dark';again.type='button';again.textContent='Nochmal';again.onclick=()=>{hostState.ph='lobby';hostState.sc={};qGenErr='';renderQuiz();};const row=document.createElement('div');row.className='row';row.appendChild(again);lobby.appendChild(row);}
    });
  } else {
    setText(board,st.q); setLobby('Q',()=>{});
    const mine=myAns&&myAns.id===st.id&&myAns.qi===st.qi?myAns.c:-1, joined=quizJoined===st.id;
    const ok=[st.id,st.qi,st.ph,mine,joined?1:0].join('|');
    if(opts.dataset.k!==ok){
      opts.dataset.k=ok; opts.innerHTML='';
      st.o.forEach((o,i)=>{const b=document.createElement('button');b.type='button';b.className='qopt c'+i;b.textContent=o;
        if(i===mine)b.classList.add('mine');
        if(st.ph==='reveal'){b.disabled=true;b.classList.add(i===st.a?'right':'wrong');}
        else if(mine>=0||!joined)b.disabled=true;
        b.onclick=()=>answer(i);opts.appendChild(b);});
    }
  }
  drawStage(st,players);
}
function drawStage(st,players){
  const W=240,H=80; const X=qsx;
  X.fillStyle='#2a1a55';X.fillRect(0,0,W,H);
  for(let i=0;i<12;i++){X.fillStyle=i%2?'#33206a':'#2d1c60';X.beginPath();X.moveTo(W/2,-10);X.lineTo(i*22-10,H);X.lineTo(i*22+12,H);X.fill();}
  for(let x=4;x<W;x+=8){X.fillStyle=(Math.floor(performance.now()/300)+x/8)%2?'#f2c94c':'#8a6a20';X.fillRect(x,2,2,2);}
  X.fillStyle='#e8506c';X.fillRect(0,66,W,14);X.fillStyle='#b8335a';for(let x=0;x<W;x+=4)X.fillRect(x,70+((x/4)%2),2,1);
  const names=document.getElementById('qNames');
  const nk=players.map(p=>p.peer+':'+p.name+':'+(p.me?1:0)+':'+(st?(st.sc[p.peer]||0):'')).join(',');
  const redoNames=names.dataset.k!==nk; if(redoNames){names.dataset.k=nk;names.innerHTML='';}
  const n=Math.max(1,players.length);
  players.forEach((p,i)=>{
    const cx=Math.round((i+.5)*W/n);
    drawAvatar(X,cx,56,p.look,{blink:false,t:0});
    X.fillStyle='#1d1238';X.fillRect(cx-11,54,22,13);X.fillStyle='#3b2a6e';X.fillRect(cx-10,55,20,11);
    X.fillStyle='#e8506c';X.fillRect(cx-3,52,6,2);X.fillStyle='#ff8aa8';X.fillRect(cx-2,52,2,1);
    if(st&&(st.ph==='q'||st.ph==='reveal')&&p.ans&&p.ans.qi===st.qi){
      const ok=st.ph==='reveal'?p.ans.c===st.a:null, y=22;
      X.fillStyle='#fffdf7';X.fillRect(cx-4,y,9,8);X.fillStyle=ok===null?'#4f7fe0':ok?'#3f9a4a':'#e8506c';
      if(ok===null){X.fillRect(cx,y+1,1,4);X.fillRect(cx,y+6,1,1);}else if(ok){X.fillRect(cx-2,y+4,1,1);X.fillRect(cx-1,y+5,1,1);X.fillRect(cx,y+4,1,1);X.fillRect(cx+1,y+3,1,1);X.fillRect(cx+2,y+2,1,1);}else{for(let k=0;k<5;k++){X.fillRect(cx-2+k,y+1+k,1,1);X.fillRect(cx+2-k,y+1+k,1,1);}}
    }
    if(redoNames){const d=document.createElement('div');d.textContent=p.name+(p.me?' (du)':'');const b=document.createElement('b');b.textContent=st?(st.sc[p.peer]||0)+' P':'';d.appendChild(b);names.appendChild(d);}
  });
  if(!players.length){X.fillStyle='#c9b8f0';X.font='8px monospace';X.fillText('',4,40);}
}
setInterval(()=>{
  hostTick();
  if(quizM.classList.contains('show')) renderQuiz();
  const h=quizHost(), st=h.self?null:quizState();
  const showJ=!!(st&&!quizM.classList.contains('show')&&st.ph!=='end'&&quizJoined!==st.id&&scene==='house');
  if(qJoin.hidden===showJ) qJoin.hidden=!showJ;
  if(showJ){const tx=`Quiz-Show von ${st.host}: mitmachen`;if(qJoin.textContent!==tx)qJoin.textContent=tx;}
},250);

