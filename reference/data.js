/* TBM careers prototype: sample data. Names, companies and applicants are fictional. */
window.TBM_DATA = (() => {
  const DEPTS = ["Brand Partnerships","Brand Solutions","Influencer Relations","Creative Team","Production","Post-Production","Human Resources","Finance","Talent Management"];
  const STAGES = ["New","Shortlisted","Interview","Offer","Hired","Rejected"];

  const ROLES = [
    { id:"creative-strategist", title:"Creative Strategist", dept:"Creative Team", type:"Full-time", exp:[2,4], pay:"₹8–12 LPA", status:"Closed",
      problem:"Turn a vague ask into a sharp brief everyone can act on.",
      resp:["Turn a business problem into a clear creative brief","Build narratives that work in English, Hindi and South Indian languages","Read results every week and drop what isn't working","Present your thinking with the math showing"],
      must:["2+ years in strategy or planning at an agency or brand","A portfolio of outcomes, not only outputs","Comfort with CTR, CVR and share of voice","Sharp, simple written English"],
      nice:["Works in a South Indian language"],
      metrics:"Ideas that move the number they were meant to move.",
      keys:["strategy","brief","data","insight","share of voice","regional","revenue","campaign"], langs:["Tamil","Telugu","Kannada","Malayalam"] },
    { id:"copywriter", title:"Creative Writer", dept:"Creative Team", type:"Full-time", exp:[1,3], pay:"₹4–7 LPA", status:"Open",
      problem:"Write lines people repeat, not lines people scroll past.",
      resp:["Write hooks, scripts and captions for creator content","Adapt one idea across platforms without losing the point","Test two versions of every hook and keep the winner","Work with TBM Studio on shoot-day scripts"],
      must:["1+ year writing for brands or creators","Equally sharp in English and Hinglish","A portfolio with live work","Takes edits without taking them personally"],
      nice:["Has written for performance ads","Knows a regional language"],
      metrics:"Hook retention in the first three seconds and save rates.",
      keys:["copy","script","hook","hinglish","writing","caption"], langs:["Hindi"] },
    { id:"social-media-executive", title:"Social Media Executive", dept:"Creative Team", type:"Full-time", exp:[1,3], pay:"₹4–6 LPA", status:"Open",
      problem:"Run brand pages people actually choose to follow.",
      resp:["Plan and run monthly content calendars for two to three brand pages","Turn trends into posts within the same day, not the same week","Read page numbers every week and change what isn't working","Work with writers, designers and TBM Studio on every post"],
      must:["1+ year running social media for brands or creators","Knows Instagram, YouTube and LinkedIn from the inside","Can explain why a post worked, with numbers","Organised enough to never miss a go-live"],
      nice:["Basic Canva or editing skills","Has grown a page from scratch"],
      metrics:"Reach, saves and follower growth on the pages you run.",
      keys:["social","instagram","content calendar","trend","community","reels","analytics"], langs:[] },
    { id:"production-intern", title:"Production Intern", dept:"Production", type:"Internship", exp:[0,1], pay:"₹15–20k a month", status:"Open",
      problem:"Learn how a shoot really runs, by running parts of one.",
      resp:["Help plan shoots: locations, props, call sheets","Track budgets and vendor bills","Be on set and keep the shoot day on time","Log and hand over footage to post-production"],
      must:["Curious about how ads and content get made","Organised and quick on follow-ups","Happy to be on set, on your feet","Available for 6 months, in office"],
      nice:["Has shot or assisted on any shoot, even a college one"],
      metrics:"Shoot days that start and wrap on time.",
      keys:["production","shoot","call sheet","set","vendor","crew"], langs:[] },
    { id:"ir-intern", title:"Influencer Relations Intern", dept:"Influencer Relations", type:"Internship", exp:[0,1], pay:"₹15–20k a month", status:"Open",
      problem:"Learn how a creator campaign really runs, by running parts of one.",
      resp:["Shortlist creators against a brief","Track deliverables and go-live dates","Write first drafts of creator briefs","Sit in on negotiations and take notes that get used"],
      must:["Lives on Instagram and YouTube, and can explain why things work","Organised and quick on follow-ups","Available for 6 months, in office"],
      nice:["Speaks a regional language"],
      metrics:"Shortlists that get approved on the first pass.",
      keys:["creator","instagram","youtube","organised","influencer"], langs:[] },
    { id:"brand-partnerships-manager", title:"Brand Partnerships Manager", dept:"Brand Partnerships", type:"Full-time", exp:[3,5], pay:"₹10–15 LPA", status:"Open",
      problem:"Start every conversation with the problem, not the pitch.",
      resp:["Build a pipeline of new partnerships","Lead discovery calls that start with the business, not the deck","Own proposals, pricing and closure","Hand over cleanly to Brand Solutions"],
      must:["3+ years in agency or media sales","A record of closed revenue you can talk through","Can read a P&L and a media plan","Calm in a room of CXOs"],
      nice:["Experience selling influencer or content work"],
      metrics:"Qualified pipeline, win rate and first-year account value.",
      keys:["sales","pipeline","revenue","pitch","client","closure","b2b"], langs:[] },
    { id:"brand-solutions-executive", title:"Brand Solutions Executive", dept:"Brand Solutions", type:"Full-time", exp:[1,3], pay:"₹5–8 LPA", status:"Closed",
      problem:"Turn a half-formed ask into a plan with dates and numbers on it.",
      resp:["Run day-to-day communication on two to three accounts","Convert briefs into scoped plans, timelines and budgets","Track delivery against promises, with specific dates","Report results a CFO would accept"],
      must:["1+ year in client servicing or account management","Spreadsheets you'd be happy to share","Writes clear, short emails","Under-promises by habit"],
      nice:["Agency experience in influencer marketing"],
      metrics:"On-time delivery and partners who stay.",
      keys:["client","servicing","account","plan","budget","report"], langs:[] },
    { id:"ir-executive-south", title:"Influencer Relations Executive, South", dept:"Influencer Relations", type:"Full-time", exp:[1,3], pay:"₹4–6 LPA", status:"Closed",
      problem:"Build a bench of Tamil, Telugu and Kannada creators people trust.",
      resp:["Discover and vet creators by audience quality, not follower count","Negotiate fair rates and clear deliverables","Keep creators paid on the date we promised","Maintain a creator database the team trusts"],
      must:["Fluent in Tamil, Telugu or Kannada","1+ year working with creators or talent","Knows how to read engagement beyond likes","Organised enough to run 30 creators at once"],
      nice:["Existing creator network in the South"],
      metrics:"Creator quality score, cost per view and repeat-creator rate.",
      keys:["creator","influencer","negotiat","regional","tamil","telugu","kannada","engagement"], langs:["Tamil","Telugu","Kannada"] },
    { id:"production-executive", title:"Production Executive, TBM Studio", dept:"Production", type:"Full-time", exp:[1,3], pay:"₹4–6 LPA", status:"Closed",
      problem:"Ship 30 shoots a month without anyone noticing the chaos.",
      resp:["Plan shoots: crew, location, props, permissions, call sheets","Hold budgets and timelines to the rupee and the hour","Run the floor on shoot day","Hand clean footage to post-production"],
      must:["1+ year in ad, film or content production","Can make a call sheet in your sleep","Stays calm when the location falls through","Owns a backup plan for every shoot"],
      nice:["Vendor network in Mumbai"],
      metrics:"Shoots delivered on time and on budget.",
      keys:["production","shoot","call sheet","budget","vendor","crew"], langs:[] },
    { id:"video-editor", title:"Video Editor, Performance", dept:"Post-Production", type:"Full-time", exp:[2,4], pay:"₹5–8 LPA", status:"Closed",
      problem:"Cut for the first three seconds, because that's all you get.",
      resp:["Edit creator and studio footage for Reels, Shorts and ads","Cut three hook variants for every video","Read retention graphs and re-cut what drops","Keep a clean, shareable project library"],
      must:["2+ years editing short-form or ads","Premiere Pro or Final Cut, plus After Effects basics","A reel with performance numbers if you have them","Fast without being sloppy"],
      nice:["Motion graphics","Colour grading"],
      metrics:"3-second hold rate and completion rate.",
      keys:["edit","premiere","after effects","reels","retention","motion"], langs:[] },
    { id:"hr-executive", title:"HR Executive", dept:"Human Resources", type:"Full-time", exp:[1,3], pay:"₹4–6 LPA", status:"Closed",
      problem:"Hire faster without lowering the bar.",
      resp:["Run hiring end to end: sourcing, screening, interviews, offers","Rebuild the slow steps in our hiring funnel, with data","Own onboarding for every new joiner","Keep the team's pulse, and act on what you hear"],
      must:["1+ year in HR or talent acquisition","Comfort with funnel numbers and simple dashboards","Writes warm, clear, specific emails","Keeps promises to candidates, on time"],
      nice:["Agency or startup HR experience","A background in psychology or org behaviour"],
      metrics:"Time-to-hire, offer acceptance rate and 90-day retention.",
      keys:["hiring","recruit","onboarding","talent","funnel","hr","people"], langs:[] },
    { id:"finance-executive", title:"Finance Executive", dept:"Finance", type:"Full-time", exp:[2,4], pay:"₹5–7 LPA", status:"Closed",
      problem:"Make sure every creator is paid on the date we promised. Every time.",
      resp:["Run payables for creators and vendors","Reconcile ledgers and bank every week","Handle GST and TDS filings with our CA","Build a monthly cash view the founders can read in 2 minutes"],
      must:["2+ years in accounts, ideally agency or services","Tally or Zoho Books, and strong Excel","GST and TDS basics","Treats a payment date as a promise"],
      nice:["CA Inter or similar"],
      metrics:"On-time payments and month-end close in 5 working days.",
      keys:["finance","gst","tds","payables","reconcil","tally","excel","accounts"], langs:[] },
    { id:"talent-manager", title:"Talent Manager", dept:"Talent Management", type:"Full-time", exp:[2,4], pay:"₹6–9 LPA", status:"Closed",
      problem:"Grow creators' careers, not only their follower counts.",
      resp:["Manage a roster of 10 to 15 creators","Plan their content, brand deals and growth","Negotiate deals that protect the creator's long-term value","Spot rising creators before they peak"],
      must:["2+ years in talent management or creator partnerships","Strong negotiation record","Understands platform algorithms and audience data","Creators would call you first"],
      nice:["Regional creator network"],
      metrics:"Roster earnings growth and creator retention.",
      keys:["talent","creator","negotiat","roster","brand deal","growth"], langs:[] }
  ];

  const A = (o) => o;
  const APPLICANTS = [
    A({ id:"a01", name:"Ishita Rao", email:"ishita.rao@example.com", phone:"98200 41512", city:"Mumbai", mumbai:"Yes", role:"creative-strategist", stage:"Interview", daysAgo:12, total:3.5, rel:3, ctc:9, ectc:11.5, notice:"30 days", buyout:"Yes", lastco:"Brightloop Digital", lastdes:"Strategy Associate", langs:["English","Hindi","Kannada"], why:"I want a team that builds briefs backwards from data, not from a mood board.", admire:"A regional food creator who turned a recipe series into a sell-out spice brand. Specific audience, specific promise.", problem:"Pick a mid-size appliance brand. Problem: high reach, low branded search. I would brief Kannada and Tamil creators on one use case and track search lift, not views.", source:"LinkedIn", fit:null }),
    A({ id:"a02", name:"Karthik Subramanian", email:"karthik.s@example.com", phone:"98400 22781", city:"Chennai", mumbai:"Yes", role:"ir-executive-south", stage:"Shortlisted", daysAgo:4, total:2, rel:2, ctc:4.2, ectc:5.5, notice:"15 days", buyout:"No", lastco:"Northstar Comms", lastdes:"Creator Partnerships Executive", langs:["English","Tamil","Telugu"], why:"I have built Tamil creator lists for two campaigns and want to do it with a team that measures cost per view, not likes.", admire:"A Tamil tech reviewer whose honest reviews drive sell-outs. Trust beats reach.", problem:"A fintech app with weak trust in Tier 2 Tamil Nadu. Use local creators who explain one feature in Tamil, and track installs by pin code.", source:"Instagram" }),
    A({ id:"a03", name:"Sneha Kulkarni", email:"sneha.k@example.com", phone:"99300 18802", city:"Pune", mumbai:"Yes", role:"hr-executive", stage:"New", daysAgo:2, total:1.5, rel:1.5, ctc:3.8, ectc:5, notice:"30 days", buyout:"Yes", lastco:"Kettle & Co.", lastdes:"HR Associate", langs:["English","Hindi","Marathi"], why:"I ran hiring for a 40-person startup and cut our offer turnaround from 9 days to 3. I want to do that on a bigger funnel.", admire:"A hiring campaign where a brand let employees film their real day. Honest beats polished.", problem:"An edtech brand with poor trust after layoffs. Use teachers as creators to show real classrooms, and track demo bookings.", source:"Referral" }),
    A({ id:"a04", name:"Rohan Desai", email:"rohan.desai@example.com", phone:"98190 55431", city:"Mumbai", mumbai:"Yes", role:"video-editor", stage:"Offer", daysAgo:21, total:4, rel:3.5, ctc:6.5, ectc:8, notice:"30 days", buyout:"Yes", lastco:"Sundial Studios", lastdes:"Editor", langs:["English","Hindi","Gujarati"], why:"I edit for retention. I want to work where someone actually reads the retention graph with me.", admire:"A mattress brand's 6-second cut that showed the product before the logo.", problem:"A D2C snack brand with good reach but weak repeat orders. Cut creator videos around one craving moment and test three hooks.", source:"LinkedIn" }),
    A({ id:"a05", name:"Meera Iyer", email:"meera.iyer@example.com", phone:"90040 11237", city:"Bengaluru", mumbai:"No", role:"creative-strategist", stage:"New", daysAgo:1, total:5, rel:2, ctc:12, ectc:16, notice:"60 days", buyout:"No", lastco:"Pixelfarm Media", lastdes:"Senior Account Manager", langs:["English","Tamil","Malayalam"], why:"I want to move from servicing to strategy.", admire:"A bank's regional language campaign that explained FDs through family stories.", problem:"A healthcare chain with low awareness outside metros. Use doctors who create content in Malayalam and track appointment bookings.", source:"Naukri" }),
    A({ id:"a06", name:"Zoya Shaikh", email:"zoya.shaikh@example.com", phone:"98330 90021", city:"Mumbai", mumbai:"Yes", role:"copywriter", stage:"Interview", daysAgo:9, total:2, rel:2, ctc:4.5, ectc:6, notice:"Immediate", buyout:"No", lastco:"Brightloop Digital", lastdes:"Copywriter", langs:["English","Hindi","Urdu"], why:"I write hooks in Hinglish that people quote back to me. I want to write them for brands that track saves.", admire:"A food delivery brand's push notifications. Ten words, one joke, one order.", problem:"A sunscreen brand people think is only for beaches. Script creators applying it before a Mumbai local train ride, and track repeat buys.", source:"Instagram" }),
    A({ id:"a07", name:"Arjun Nair", email:"arjun.nair@example.com", phone:"97690 31144", city:"Mumbai", mumbai:"Yes", role:"brand-partnerships-manager", stage:"Shortlisted", daysAgo:6, total:6, rel:4, ctc:13, ectc:16, notice:"60 days", buyout:"Yes", lastco:"Northstar Comms", lastdes:"Sales Manager", langs:["English","Hindi","Malayalam"], why:"I have closed media deals on reach. I want to sell outcomes clients can audit.", admire:"An appliance brand that sold a fan on electricity savings, not looks.", problem:"A home loan company with high cost per lead. Use finance creators to explain one EMI myth, and track leads by city.", source:"LinkedIn" }),
    A({ id:"a08", name:"Tanvi Joshi", email:"tanvi.joshi@example.com", phone:"98920 77610", city:"Thane", mumbai:"Yes", role:"production-executive", stage:"Hired", daysAgo:34, hiredAfter:24, total:2.5, rel:2.5, ctc:4, ectc:5.2, notice:"15 days", buyout:"No", lastco:"Sundial Studios", lastdes:"Production Coordinator", langs:["English","Hindi","Marathi"], why:"I like shoots that run on time. I want a studio that plans like an agency.", admire:"A one-take product demo shot in a real kitchen.", problem:"A cookware brand seen as expensive. Shoot real home cooks, one dish, one price-per-use line.", source:"Referral" }),
    A({ id:"a09", name:"Vikram Reddy", email:"vikram.reddy@example.com", phone:"99890 40012", city:"Hyderabad", mumbai:"Yes", role:"ir-executive-south", stage:"New", daysAgo:3, total:1, rel:1, ctc:3.6, ectc:4.8, notice:"Immediate", buyout:"No", lastco:"Freelance", lastdes:"Creator Manager", langs:["English","Telugu","Hindi"], why:"I manage 12 Telugu creators today and want a team that pays them on time.", admire:"A Telugu comedy creator who made a bank ad people shared for the joke.", problem:"A two-wheeler EV brand with range anxiety in Andhra. Creators ride a real daily route on camera and share the battery left.", source:"Instagram" }),
    A({ id:"a10", name:"Ananya Pillai", email:"ananya.pillai@example.com", phone:"98450 66320", city:"Kochi", mumbai:"Yes", role:"talent-manager", stage:"Rejected", rejAt:1, daysAgo:18, total:3, rel:1, ctc:6, ectc:9, notice:"30 days", buyout:"No", lastco:"Kettle & Co.", lastdes:"Marketing Executive", langs:["English","Malayalam"], why:"I love creators.", admire:"Many creators.", problem:"Any brand can grow with influencers.", source:"Other" }),
    A({ id:"a11", name:"Siddharth Jain", email:"sid.jain@example.com", phone:"98210 13390", city:"Mumbai", mumbai:"Yes", role:"finance-executive", stage:"Interview", daysAgo:8, total:3, rel:3, ctc:5.5, ectc:6.8, notice:"30 days", buyout:"Yes", lastco:"Brightloop Digital", lastdes:"Accounts Executive", langs:["English","Hindi","Gujarati"], why:"I closed books in 4 days at my last agency. I want to make creator payments boringly reliable.", admire:"A brand that published its creator payment terms. Trust as a feature.", problem:"A creator platform with payment complaints. Fix the payout calendar before spending on ads.", source:"Naukri" }),
    A({ id:"a12", name:"Fatima Ansari", email:"fatima.ansari@example.com", phone:"98670 22219", city:"Mumbai", mumbai:"Yes", role:"brand-solutions-executive", stage:"Hired", daysAgo:40, hiredAfter:19, total:2, rel:2, ctc:5, ectc:6.5, notice:"15 days", buyout:"No", lastco:"Pixelfarm Media", lastdes:"Client Servicing Executive", langs:["English","Hindi","Urdu"], why:"I like turning vague client asks into plans with dates on them.", admire:"A mattress brand's sleep-trial creator series. One promise, many proofs.", problem:"A water purifier brand losing to cheaper rivals. Show the cost of one illness against the filter price, through doctor creators.", source:"LinkedIn" }),
    A({ id:"a13", name:"Nikhil Menon", email:"nikhil.menon@example.com", phone:"97020 55613", city:"Mumbai", mumbai:"Yes", role:"video-editor", stage:"Shortlisted", daysAgo:5, total:2.5, rel:2.5, ctc:5, ectc:6.5, notice:"15 days", buyout:"No", lastco:"Freelance", lastdes:"Video Editor", langs:["English","Hindi","Malayalam"], why:"I re-cut my own videos after reading retention graphs. Most editors don't look.", admire:"A phone brand's Shorts that open on the problem, not the phone.", problem:"An earphone brand seen as cheap. Cut creator videos around one sound moment and test three hooks.", source:"Instagram" }),
    A({ id:"a14", name:"Divya Shetty", email:"divya.shetty@example.com", phone:"98860 42277", city:"Mangaluru", mumbai:"Yes", role:"ir-intern", stage:"New", daysAgo:0, total:0, rel:0, ctc:0, ectc:2.2, notice:"Immediate", buyout:"No", lastco:"College", lastdes:"Student", langs:["English","Kannada","Tulu","Hindi"], why:"I track why some Kannada creators blow up and others don't. I want to learn the business side.", admire:"A Kannada creator who reviews street food with prices on screen.", problem:"A local coffee brand unknown outside Karnataka. Creators do a 7-day filter coffee switch and show the cost per cup.", source:"College" }),
    A({ id:"a15", name:"Harsh Vora", email:"harsh.vora@example.com", phone:"99200 31876", city:"Ahmedabad", mumbai:"No", role:"copywriter", stage:"Rejected", rejAt:0, daysAgo:15, total:1, rel:0.5, ctc:3, ectc:5, notice:"30 days", buyout:"No", lastco:"Freelance", lastdes:"Content Writer", langs:["English","Gujarati"], why:"Looking for a change.", admire:"Not sure.", problem:"Use more influencers.", source:"Naukri" }),
    A({ id:"a16", name:"Pooja Naik", email:"pooja.naik@example.com", phone:"98330 64410", city:"Mumbai", mumbai:"Yes", role:"hr-executive", stage:"Shortlisted", daysAgo:6, total:2, rel:2, ctc:4.2, ectc:5.4, notice:"30 days", buyout:"Yes", lastco:"Northstar Comms", lastdes:"Talent Acquisition Executive", langs:["English","Hindi","Marathi","Konkani"], why:"I have hired 40 people in a year. I want to fix the funnel, not only fill it.", admire:"A company that sent rejected candidates real feedback. People remembered.", problem:"A gym chain with high trial drop-off. Members film week 1 honestly and the brand tracks week-4 retention.", source:"LinkedIn" })
  ];

  const FIELDS = [
    // step, id, label, type, required, on, locked, options, hint
    { step:"personal", id:"name", label:"Full name", type:"text", required:true, on:true, locked:true },
    { step:"personal", id:"email", label:"Email", type:"email", required:true, on:true, locked:true },
    { step:"personal", id:"phone", label:"Phone / WhatsApp", type:"tel", required:true, on:true },
    { step:"personal", id:"age", label:"Age", type:"number", required:false, on:true, min:16, max:70 },
    { step:"personal", id:"gender", label:"Gender", type:"select", required:false, on:true, options:["Woman","Man","Non-binary","Prefer not to say"], hint:"Optional. Used only to check our hiring is fair." },
    { step:"personal", id:"city", label:"Current city", type:"text", required:true, on:true },
    { step:"personal", id:"mumbai", label:"Open to working from our Lower Parel office?", type:"yesno", required:true, on:true },
    { step:"role", id:"dept", label:"Department", type:"dept", required:true, on:true, locked:true },
    { step:"role", id:"role", label:"Role", type:"role", required:true, on:true, locked:true },
    { step:"role", id:"joining", label:"Earliest joining date", type:"date", required:true, on:true },
    { step:"role", id:"notice", label:"Notice period", type:"select", required:true, on:true, options:["Immediate","15 days","30 days","60 days","90 days"] },
    { step:"role", id:"buyout", label:"Buyout possible?", type:"yesno", required:false, on:true },
    { step:"comp", id:"ctc", label:"Current CTC (₹ LPA)", type:"number", required:true, on:true, min:0, max:200, hint:"Put 0 if you're a student or between jobs." },
    { step:"comp", id:"ectc", label:"Expected CTC (₹ LPA)", type:"number", required:true, on:true, min:0, max:200 },
    { step:"comp", id:"negotiable", label:"Is that negotiable?", type:"yesno", required:false, on:true },
    { step:"exp", id:"total", label:"Total experience (years)", type:"number", required:true, on:true, min:0, max:40 },
    { step:"exp", id:"rel", label:"Relevant experience (years)", type:"number", required:true, on:true, min:0, max:40 },
    { step:"exp", id:"lastco", label:"Last company", type:"text", required:false, on:true },
    { step:"exp", id:"lastdes", label:"Last designation", type:"text", required:false, on:true },
    { step:"exp", id:"langs", label:"Languages you work in", type:"langs", required:true, on:true, options:["English","Hindi","Marathi","Tamil","Telugu","Kannada","Malayalam","Bengali","Gujarati","Urdu"] },
    { step:"links", id:"resume", label:"Resume", type:"file", required:true, on:true, locked:true, hint:"PDF or DOC, up to 5 MB." },
    { step:"links", id:"portfolio", label:"Portfolio link", type:"url", required:false, on:true },
    { step:"links", id:"linkedin", label:"LinkedIn", type:"url", required:false, on:true },
    { step:"links", id:"instagram", label:"Instagram handle or link", type:"text", required:false, on:true },
    { step:"about", id:"why", label:"Why TBM?", type:"long", required:true, on:true, hint:"Skip “passionate about marketing”. Tell us something specific." },
    { step:"about", id:"admire", label:"A campaign or creator you admire, and why it worked", type:"long", required:false, on:true },
    { step:"about", id:"problem", label:"Pick a brand. What business problem would you solve with influencers?", type:"long", required:true, on:true, hint:"Three lines is plenty. Name the number you'd move." },
    { step:"final", id:"source", label:"Where did you hear about us?", type:"select", required:false, on:true, options:["LinkedIn","Instagram","Referral","Naukri","College","Other"] },
    { step:"final", id:"referral", label:"Referred by (if anyone)", type:"text", required:false, on:true },
    { step:"final", id:"consent", label:"I agree that TBM may store my application for 12 months to consider me for roles. I can ask for deletion at any time.", type:"consent", required:true, on:true, locked:true }
  ];

  const STEPS = [
    { id:"personal", label:"You" }, { id:"role", label:"Role" }, { id:"comp", label:"Pay" },
    { id:"exp", label:"Experience" }, { id:"links", label:"Links" }, { id:"about", label:"Thinking" }, { id:"final", label:"Last bit" }
  ];

  /* Team gallery. To add a photo: put the file in assets/gallery/ and set src (and alt). Slots without src show as empty frames. */
  const GALLERY = [
    { src:"assets/team-1800.jpg", srcset:"assets/team-900.jpg 900w, assets/team-1800.jpg 1800w", alt:"About forty members of the TBM team sitting together on the steps of a white colonnaded building, smiling, many in sunglasses." },
    { src:"", alt:"" }, { src:"", alt:"" }, { src:"", alt:"" }, { src:"", alt:"" }, { src:"", alt:"" }
  ];

  /* Brand strip, names as listed on theboredmonkey.com. To show a real logo: put the file in assets/brands/ and set logo. Without logo, the name is set as a wordmark. */
  const BRANDS = ["Atomberg","Wakefit","boAt","Meesho","Ajio","Pizza Hut","Noise","Plum","Pilgrim","Mobikwik","OZiva","Boult","Lotte","Neeman's","Two Brothers","Yogabar","Happy Planet","Streax","Rentomojo","Toothsi","Plix","SuperBottoms","Pratilipi","Akbar Travels"].map((name) => ({ name, logo:"" }));

  return { DEPTS, STAGES, ROLES, APPLICANTS, FIELDS, STEPS, GALLERY, BRANDS };
})();
