/**
 * RegionLearn-Bridge AI Engine
 * "Granite-8B-Indic-Pedagogy" Specialized Emulated Inference Pipeline & Vernacular Speech Engine
 * Engineered for Frugal AI Unit Economics (< ₹11.50/student/month compute)
 */

class RegionLearnAIEngine {
  constructor() {
    this.modelName = "IBM Granite-8B Indic Pedagogy (Quantized INT4)";
    this.version = "v3.0-indic-frugal-core";
    this.speechRecognition = null;
    this.speechSynthesis = window.speechSynthesis || null;
    this.isListening = false;
    this.currentLanguage = "hi-IN"; // Default Hindi
    this.dialectMode = "rural_analogy";
    
    // Performance & Frugal Compute Tracker
    this.sessionStats = {
      tokensProcessed: 1840,
      audioBytesTransferredKB: 52.4,
      cachedQueriesServed: 18,
      estimatedCostINR: 0.28,
      monthlyCostEstimateINR: 11.50
    };

    // State machine for Socratic dialogue
    this.conversationContext = {
      activeTopic: "general_stem",
      difficultyLevel: "foundational",
      consecutiveMistakes: 0,
      currentStep: 1,
      studentName: "Aakash (Class 10)",
      dialogueHistory: []
    };

    this.initSpeechRecognition();
    this.initKnowledgeBase();
  }

  // 1. Initialize Bhashini-Compatible Web Speech Pipeline
  initSpeechRecognition() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        this.speechRecognition = new SpeechRec();
        this.speechRecognition.continuous = false;
        this.speechRecognition.interimResults = false;
        this.speechRecognition.lang = this.currentLanguage;

        this.speechRecognition.onresult = (event) => {
          if (event.results && event.results[0] && event.results[0][0]) {
            const transcript = event.results[0][0].transcript;
            if (this.onSpeechResultCallback) {
              this.onSpeechResultCallback(transcript);
            }
          }
        };

        this.speechRecognition.onerror = (err) => {
          console.warn("Speech recognition notice:", err.error);
          this.isListening = false;
          if (this.onListeningStateChange) this.onListeningStateChange(false);
          if (this.onSpeechErrorCallback) {
            this.onSpeechErrorCallback(err.error);
          }
        };

        this.speechRecognition.onend = () => {
          this.isListening = false;
          if (this.onListeningStateChange) {
            this.onListeningStateChange(false);
          }
        };
      } catch (e) {
        console.warn("Failed to construct SpeechRecognition:", e);
      }
    }
  }

  setLanguage(langCode) {
    this.currentLanguage = langCode;
    if (this.speechRecognition) {
      this.speechRecognition.lang = langCode;
    }
  }

  startListening(onResult, onError, onStateChange) {
    this.onSpeechResultCallback = onResult;
    this.onSpeechErrorCallback = onError;
    this.onListeningStateChange = onStateChange;

    if (!this.speechRecognition) {
      if (onError) onError("speech_api_unsupported");
      return;
    }

    try {
      this.speechRecognition.lang = this.currentLanguage;
      this.speechRecognition.start();
      this.isListening = true;
      if (onStateChange) onStateChange(true);
    } catch (e) {
      console.warn("Recognition start error:", e);
      if (onError) onError(e.message || "start_failed");
    }
  }

  stopListening() {
    if (this.speechRecognition && this.isListening) {
      try {
        this.speechRecognition.stop();
      } catch (e) {
        console.warn("Stop error:", e);
      }
      this.isListening = false;
      if (this.onListeningStateChange) this.onListeningStateChange(false);
    }
  }

  // Speak with regional Indic voice
  speakText(text, lang = null, onEndCallback = null) {
    if (!this.speechSynthesis) return;

    try {
      this.speechSynthesis.cancel();

      // Clean text of markdown asterisks and emojis for speech
      const cleanSpeech = text
        .replace(/[*#_~`]/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');

      const utterance = new SpeechSynthesisUtterance(cleanSpeech);
      const targetLang = lang || this.currentLanguage;
      utterance.lang = targetLang;
      utterance.rate = 0.90; // Measured pace for rural comprehension
      utterance.pitch = 1.0;

      const voices = this.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith(targetLang.substring(0, 2)) || v.name.includes("India"));
      if (voice) utterance.voice = voice;

      if (onEndCallback) {
        utterance.onend = onEndCallback;
        utterance.onerror = onEndCallback;
      }

      this.speechSynthesis.speak(utterance);
      this.sessionStats.audioBytesTransferredKB += (cleanSpeech.length * 0.05);
    } catch (e) {
      console.warn("TTS Error:", e);
      if (onEndCallback) onEndCallback();
    }
  }

  stopSpeech() {
    if (this.speechSynthesis) {
      try {
        this.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  // 2. Comprehensive Indic Dialect & STEM Pedagogical Knowledge Base
  initKnowledgeBase() {
    this.conceptRepository = {
      // 1. Ohm's Law
      "ohm_law": {
        id: "ohm_law",
        keywords: ["ohm", "voltage", "current", "resistance", "विद्युत", "ओम", "bijli", "ampere", "volt", "v=ir"],
        title: "Ohm's Law (ओम का नियम - V = IR)",
        subject: "Physics (Class 10)",
        boardSyllabus: "NCERT Chapter 12: Electricity",
        textbookDefinition: "At constant temperature, electric current flowing through a metallic conductor is directly proportional to the potential difference across its ends (V = I × R).",
        ruralStuckReason: "Students memorize V=IR without understanding what 'potential difference' or 'resistance' physically means in daily life.",
        prerequisiteGap: "Ratios & Proportions from Class 7 & 8 arithmetic; difference between pressure and flow.",
        transcreations: {
          "hi-IN": {
            analogyName: "गांव की नहर और नलकूप (Village Canal & Tubewell)",
            explanation: "सोचो तुम्हारे खेत में पानी आ रहा है:\n• **Voltage (V) = नलकूप का पम्प/प्रेशर**: जितना तेज़ पम्प पानी को धक्का देगा, उतना ज्यादा दबाव बनेगा।\n• **Current (I) = बहता हुआ पानी**: नाली में कितना पानी एक सेकण्ड में बह रहा है।\n• **Resistance (R) = नाली में फंसा कचरा, कीचड़ या संकरा रास्ता**: जो पानी के बहाव को रोकता है!\n\nअगर नाली संकरी होगी (R बढ़ेगा), तो पानी धीरे बहेगा (I घटेगा)। अगर पम्प का प्रेशर बढ़ाओगे (V बढ़ेगा), तो पानी तेज़ बहेगा (I बढ़ेगा)। यही है **V = I × R**!",
            socraticPrompt: "अब बताओ: अगर नाली में बहुत सारी घास और पत्थर जम जाएं (मतलब Resistance बढ़ जाए) और पम्प का प्रेशर वही रहे, तो खेत में पानी (Current) ज्यादा पहुंचेगा या कम?"
          },
          "te-IN": {
            analogyName: "పొలం కాలువ మరియు మోటార్ పంపు (Farm Canal & Motor Pump)",
            explanation: "మీ పొలంలో నీటి పారుదలని ఊహించుకోండి:\n• **వోల్టేజ్ (V)**: మోటార్ పంపు ఇచ్చే నీటి ఒత్తిడి (Pressure).\n• **కరెంట్ (I)**: కాలువలో ప్రవహించే నీటి ప్రవాహం (Water flow).\n• **రెసిస్టెన్స్ (R)**: కాలువలో ఉండే రాళ్ళు, చెత్త లేదా అడ్డంకులు.\nఅడ్డంకులు ఎక్కువైతే నీరు తక్కువ ప్రవహిస్తుంది. ప్రెషర్ పెంచితే నీటి ప్రవాహం పెరుగుతుంది. ఇదే **V = I × R**!",
            socraticPrompt: "కాలువలో అడ్డంకులు (Resistance) పెరిగితే, నీటి ప్రవాహం (Current) పెరుగుతుందా లేక తగ్గుతుందా?"
          },
          "mr-IN": {
            analogyName: "शेतातील विहिरीचा पंप आणि पाट (Well Pump & Farm Canal)",
            explanation: "शेतात पाणी देताना विचार करा:\n• **व्होल्टेज (V)**: विहिरीच्या मोटार पंपाचा पाण्याचा दाब.\n• **करंट (I)**: पाटातून वाहणाऱ्या पाण्याचा प्रवाह.\n• **रेझिस्टन्स (R)**: पाटातील गवत, दगड किंवा अडथळे.\nदाब वाढवला की पाणी जास्त वाहणार, आणि अडथळे वाढले की पाणी कमी वाहणार! हाच आहे **V = I × R**.",
            socraticPrompt: "जर पाटात गाळ आणि दगड जास्त असतील (Resistance वाढला), तर पाणी (Current) कमी येईल की जास्त?"
          },
          "en-IN": {
            analogyName: "Village Tubewell & Irrigation Ditch Metaphor",
            explanation: "Imagine watering your field with a tubewell:\n• **Voltage (V)** = The water pressure exerted by the diesel pump.\n• **Current (I)** = The actual flow rate of water in liters/sec through the ditch.\n• **Resistance (R)** = Mud, weeds, and narrowing of the ditch fighting the water flow.\nMore pump pressure (V) pushes more water (I). More weed blockage (R) reduces water flow (I). Hence, **V = I × R**!",
            socraticPrompt: "Quick check: If the irrigation ditch gets choked with weeds (Resistance goes up), will the water flow (Current) increase or decrease?"
          }
        }
      },

      // 2. Photosynthesis
      "photosynthesis": {
        id: "photosynthesis",
        keywords: ["photo", "photosynthesis", "prakash", "sanshleshan", "chulha", "patta", "leaf", "chlorophyll", "stomata", "glucose", "पौधे", "प्रकाश संश्लेषण"],
        title: "Photosynthesis (प्रकाश संश्लेषण)",
        subject: "Biology (Class 10)",
        boardSyllabus: "NCERT Chapter 6: Life Processes",
        textbookDefinition: "The biochemical process by which autotrophic organisms convert light energy into chemical energy, synthesizing glucose from CO2 and water in the presence of chlorophyll.",
        ruralStuckReason: "Heavy chemical terminology (Photolysis, Stomata, Chloroplast) detaches students from the simple fact that leaves are food factories.",
        prerequisiteGap: "Plant cell structure (Chloroplasts) and the concept of chemical reactions.",
        transcreations: {
          "hi-IN": {
            analogyName: "गांव का मिट्टी का चूल्हा और रसोई (Village Mud Chulha & Kitchen)",
            explanation: "जैसे तुम्हारी माँ शाम को चूल्हे पर रोटी बनाती हैं, वैसे ही पेड़ का हर पत्ता एक **रसोईघर (Kitchen)** है!\n• **कच्चा अनाज (CO2)**: जो हवा से पत्तों के छोटे छिद्रों (Stomata) से अंदर आता है।\n• **पानी (H2O)**: जो जड़ें जमीन से खींचकर ऊपर भेजती हैं।\n• **चूल्हे की आग (धूप / Sunlight)**: जो आसमान से ऊर्जा देती है।\n• **कड़ाही / चूल्हा (Chlorophyll)**: जो इस धूप की गर्मी को पकड़ता है।\n\nजब ये चारों मिलते हैं, तो बनती है 'मीठी रोटी' यानी **Glucose**, और हमारे सांस लेने के लिए बनती है शुद्ध हवा यानी **Oxygen**!",
            socraticPrompt: "अगर रात में धूप (चूल्हे की आग) ना हो, तो क्या पत्ता रोटी (खाना) पका पाएगा?"
          },
          "te-IN": {
            analogyName: "గ్రామీణ వంటిల్లు మరియు పొయ్యి (Village Hearth & Cooking)",
            explanation: "చెట్టు ఆకును ఒక చిన్న వంటిల్లుగా ఊహించుకోండి:\n• గాలిలోని కార్బన్ డయాక్సైడ్ = వంట బియ్యం.\n• వేర్లు పీల్చే నీరు = వంట నీరు.\n• సూర్యరశ్మి = పొయ్యి మంట.\n• క్లోరోఫిల్ = వంట పాత్ర.\nఇవన్నీ కలిసి మొక్కకు ఆహారాన్ని (గ్లూకోజ్), మనకు ప్రాణవాయువును (ఆక్సిజన్) ఇస్తాయి!",
            socraticPrompt: "రాత్రి వేళల్లో సూర్యుడి వెలుతురు లేనప్పుడు మొక్కలు ఆహారం తయారు చేసుకోగలవా?"
          },
          "en-IN": {
            analogyName: "The Village Hearth & Chulha Kitchen",
            explanation: "Think of every green leaf as an outdoor village kitchen:\n• **Ingredients**: Raw flour is Carbon Dioxide from the air, and water is pumped up by roots from the soil.\n• **The Stove Fire**: Sunlight providing the cooking heat.\n• **The Black Cooking Pot**: Chlorophyll absorbing the sun's rays.\n• **The Prepared Meal**: Glucose (food for the tree) plus fresh Oxygen released into the air!",
            socraticPrompt: "If the sun goes down and there is no solar heat, can the leaf kitchen prepare food?"
          }
        }
      },

      // 3. Newton's 3rd Law
      "newton_third_law": {
        id: "newton_third_law",
        keywords: ["newton", "motion", "gati", "boat", "cart", "nao", "bailgadi", "action", "reaction", "क्रिया", "प्रतिक्रिया", "बल", "force"],
        title: "Newton's 3rd Law of Motion (क्रिया और प्रतिक्रिया)",
        subject: "Physics (Class 9/10)",
        boardSyllabus: "NCERT Chapter 9: Force and Laws of Motion",
        textbookDefinition: "To every action, there is always an equal and opposite reaction.",
        ruralStuckReason: "Students think forces cancel each other out or don't realize forces act on *different* bodies.",
        prerequisiteGap: "Direction of force vectors and contact forces.",
        transcreations: {
          "hi-IN": {
            analogyName: "नाव से नदी किनारे कूदना और बैलगाड़ी (Boat Jump & Bullock Cart)",
            explanation: "कभी नदी पार करके नाव से किनारे पर छलांग लगाई है?\n• जब तुम किनारे की तरफ छलांग लगाते हो, तो तुम्हारे पैर नाव को **पीछे** धक्का देते हैं (Action)।\n• और वही नाव तुम्हारे शरीर को **आगे** फेंकती है (Reaction)!\n• अगर नाव पानी में पीछे ना खिसकती, तो तुम आगे नहीं कूद पाते।\n\nदोनों बल बराबर होते हैं लेकिन दो अलग चीजों पर लगते हैं: एक तुम्हारे पैरों पर, दूसरा नाव पर!",
            socraticPrompt: "जब बंदूक या गुलेल से गोली निकलती है, तो कंधा पीछे क्यों झटकता है?"
          },
          "en-IN": {
            analogyName: "Jumping off a River Boat & Bullock Cart",
            explanation: "Whenever you step off a wooden boat onto the riverbank:\n• You push the boat backwards with your feet (Action).\n• Simultaneously, the boat pushes your body forward onto dry land (Reaction).\nBoth forces are identical in strength, but they push on two DIFFERENT objects!",
            socraticPrompt: "Why does an earthen slingshot or firecracker recoil in the opposite direction?"
          }
        }
      },

      // 4. Osmosis
      "osmosis": {
        id: "osmosis",
        keywords: ["osmo", "osmosis", "chana", "pickle", "achaar", "pani", "kishmish", "raisin", "परासरण", "कोशिका"],
        title: "Osmosis & Cell Absorption (परासरण)",
        subject: "Biology / Chemistry",
        boardSyllabus: "NCERT Chapter 5: Fundamental Unit of Life",
        textbookDefinition: "Diffusion of water across a selectively permeable membrane from an area of higher water concentration to lower water concentration.",
        ruralStuckReason: "Confused between solvent and solute movement.",
        prerequisiteGap: "Concentration differences and permeable barriers.",
        transcreations: {
          "hi-IN": {
            analogyName: "रात में चने भिगोना और आम का अचार (Soaked Chickpeas & Mango Pickle)",
            explanation: "• जब तुम्हारी दादी सूखे चने को पानी के कटोरे में डालती हैं, तो सुबह चना फूलकर मोटा क्यों हो जाता है? क्योंकि कटोरे में पानी ज्यादा था, और चने के अंदर कम। चने के छिलके ने पानी को अंदर खींच लिया!\n• दूसरी तरफ, जब कच्चे आम पर नमक डालते हैं, तो आम का सारा पानी बाहर निकलकर आचार का तेल-मसाला बन जाता है।\nयही जादू है **Osmosis** का!",
            socraticPrompt: "अगर हम किशमिश को बहुत मीठे गाढ़े चाशनी में डाल दें, तो वह फूलेगी या सिकुड़ेगी?"
          },
          "en-IN": {
            analogyName: "Grandmother's Soaked Chickpeas (Chana) & Mango Pickle",
            explanation: "Why do hard, dry chickpeas swell up overnight when soaked in a water bowl? Water rushes into the chickpea because there is higher water concentration outside than inside through the seed's thin skin.\nConversely, when coarse salt is rubbed on raw mango for pickles, water rushes OUT of the mango slices! That is Osmosis.",
            socraticPrompt: "What happens if you leave dried raisins in pure well water for 4 hours?"
          }
        }
      },

      // 5. Quadratic Equations
      "quadratic_equations": {
        id: "quadratic_equations",
        keywords: ["quadrat", "quadratic", "dwighat", "sami", "x2", "factor", "splitting", "khet", "batwara", "समीकरण", "द्विघात"],
        title: "Quadratic Equations (द्विघात समीकरण - ax² + bx + c = 0)",
        subject: "Mathematics (Class 10)",
        boardSyllabus: "NCERT Chapter 4: Quadratic Equations",
        textbookDefinition: "An algebraic equation of second degree where the highest exponent of variable x is 2.",
        ruralStuckReason: "Terrified of splitting the middle term or remembering the quadratic formula (-b ± √(b² - 4ac))/2a.",
        prerequisiteGap: "Integer multiplication with negative signs; calculating area of rectangular farm plots.",
        transcreations: {
          "hi-IN": {
            analogyName: "खेत का बँटवारा और मेड़ की लम्बाई (Farm Plot Boundary Calculation)",
            explanation: "मान लो तुम्हारे पास एक आयताकार खेत है।\n• खेत की लम्बाई, चौड़ाई से 3 मीटर ज्यादा है (Length = x + 3).\n• और पूरे खेत का क्षेत्रफल 70 वर्ग मीटर है (Area = x × (x + 3) = 70).\nअब बताओ चौड़ाई कितनी होगी?\nयही समीकरण बनता है: **x² + 3x - 70 = 0**।\nहमें ऐसी दो संख्याएं ढूंढनी हैं जिनका गुणा -70 हो और घटाने पर 3 बचे (10 और 7)! तो खेत की चौड़ाई सीधे 7 मीटर निकल आई!",
            socraticPrompt: "अगर दो संख्याओं को गुणा करने पर 24 आए और जोड़ने पर 10 आए, तो वे दो संख्याएं कौन सी होंगी?"
          },
          "en-IN": {
            analogyName: "Village Land Patwari Plot Boundary Division",
            explanation: "Imagine a rectangular crop field where the length is 3 meters longer than the width, and the total seed-sown area is 70 sq meters.\nx × (x + 3) = 70 -> x² + 3x - 70 = 0.\nInstead of memorizing mechanical formulas, we look for two numbers whose product is 70 and difference is 3: That's 10 and 7!",
            socraticPrompt: "Can you think of two numbers that multiply to 24 and add up to 10?"
          }
        }
      },

      // 6. Chemical Reactions & Balancing
      "chemical_balancing": {
        id: "chemical_balancing",
        keywords: ["balance", "balancing", "equation", "chemical", "react", "chemistry", "tarazu", "द्रव्यमान", "संतुलित"],
        title: "Balancing Chemical Equations (रासायनिक समीकरण संतुलन)",
        subject: "Chemistry (Class 10)",
        boardSyllabus: "NCERT Chapter 1: Chemical Reactions and Equations",
        textbookDefinition: "The number of atoms of each element must remain equal on both sides of a chemical equation to obey the Law of Conservation of Mass.",
        ruralStuckReason: "Students try random trial and error with coefficients without visualizing atoms as physical counters.",
        prerequisiteGap: "Law of conservation of mass and counting atoms in molecules.",
        transcreations: {
          "hi-IN": {
            analogyName: "दुकानदार की तराजू (Village Grocer's Balance Scale)",
            explanation: "रासायनिक समीकरण को गांव की **किराने की तराजू (Tarazu)** समझो!\n• बाईं तरफ (Reactants): जो सामान तुम पलड़े में रख रहे हो।\n• दाईं तरफ (Products): जो नया सामान बनकर निकला।\nकुदरत का नियम है: न तो कोई नया परमाणु (atom) पैदा हो सकता है, न ही गायब हो सकता है।\nअगर बाईं तरफ 4 हाइड्रोजन और 2 ऑक्सीजन हैं, तो दाईं तरफ भी तराजू के पलड़े में ठीक 4 हाइड्रोजन और 2 ऑक्सीजन होने ही चाहिए (2H₂ + O₂ → 2H₂O)!",
            socraticPrompt: "अगर तराजू के एक पलड़े पर 2 किलो आलू और 1 किलो प्याज है, तो दूसरे पलड़े पर बराबर तोलने के लिए कितने किलो का बाट रखना होगा?"
          },
          "en-IN": {
            analogyName: "The Village Grocer's Dual-Pan Balance",
            explanation: "Think of a chemical reaction like an old-fashioned village balance scale:\nWhatever mass and number of atoms you put in the left pan (reactants) MUST come out identical in the right pan (products).\nAtoms can rearrange who they hold hands with, but you cannot destroy or create them out of thin air!",
            socraticPrompt: "If you have 4 Hydrogen atoms entering a reaction, how many must emerge on the other side?"
          }
        }
      },

      // 7. Refraction & Human Eye
      "refraction_eye": {
        id: "refraction_eye",
        keywords: ["light", "refract", "lens", "eye", "prakash", "apavartan", "drishti", "lens", "अपवर्तन", "लेंस", "आंख"],
        title: "Refraction of Light & Lenses (प्रकाश का अपवर्तन)",
        subject: "Physics (Class 10)",
        boardSyllabus: "NCERT Chapter 10 & 11: Light and the Human Eye",
        textbookDefinition: "The change in direction of a light wave passing from one medium to another caused by its change in speed.",
        ruralStuckReason: "Formula memorization (1/f = 1/v - 1/u) without grasping why light bends in denser mediums.",
        prerequisiteGap: "Speed of light and refractive index concepts.",
        transcreations: {
          "hi-IN": {
            analogyName: "सड़क से कीचड़ में साइकिल चलाना (Bicycle from Asphalt into Mud)",
            explanation: "सोचो तुम पक्की सड़क पर तेज़ साइकिल चला रहे हो, और अचानक साइकिल का अगला पहिया तिरछे होकर कीचड़ में घुस जाता है:\n• जो पहिया पहले कीचड़ में गया, वह धीमा हो जाएगा।\n• जो पहिया अभी सड़क पर है, वह तेज़ रहेगा।\nनतीजा? तुम्हारी साइकिल तुरंत मुड़ (bend) जाएगी!\nयही प्रकाश के साथ होता है: जब रोशनी हवा से शीशे या पानी में जाती है, तो उसकी रफ्तार धीमी हो जाती है और वह मुड़ जाती है!",
            socraticPrompt: "जब तुम साफ तालाब में मछली को देखते हो, तो मछली अपनी असली जगह से थोड़ी ऊपर क्यों दिखाई देती है?"
          },
          "en-IN": {
            analogyName: "Bicycle Riding from Concrete Road into Wet Mud",
            explanation: "Imagine riding a cycle at full speed on tarmac, and one wheel suddenly hits muddy grass at an angle:\nThe wheel entering mud slows down first, while the other wheel stays fast, causing the cycle to jerk and bend its path.\nLight does the exact same thing when moving from thin air into dense glass or water!",
            socraticPrompt: "Why does a straight wooden stick dipped in water appear bent at the surface?"
          }
        }
      }
    };

    // Diagnostic Questions linked to Prerequisite Knowledge Graph
    this.diagnosticQuiz = [
      {
        id: "q1",
        subject: "Physics",
        topic: "Electricity & Circuits",
        questionText: "A 6-Ohm resistor and a 3-Ohm resistor are connected in PARALLEL to a 12V tractor battery. What is the equivalent resistance of this circuit?",
        options: [
          { text: "9 Ohms (Just add them: 6 + 3)", correct: false, diagnosedGap: "Series vs Parallel confusion" },
          { text: "2 Ohms (1/R = 1/6 + 1/3 = 3/6 -> R = 2)", correct: true },
          { text: "18 Ohms (Multiply them: 6 × 3)", correct: false, diagnosedGap: "Foundational arithmetic formula gap" },
          { text: "4.5 Ohms (Take average: (6+3)/2)", correct: false, diagnosedGap: "Arithmetic mean confusion" }
        ],
        remedialExplanation: "In parallel paths (like two water pipes branching from a main pump), adding another pipe gives water MORE room to flow, so total resistance drops to 2 Ohms!",
        prerequisiteNode: "fractions_reciprocal"
      },
      {
        id: "q2",
        subject: "Chemistry",
        topic: "Chemical Reactions",
        questionText: "When slaked lime (Chuna / Ca(OH)2) is painted on village mud walls, why does it shine bright white after 2 to 3 days?",
        options: [
          { text: "It dries in the sun and water evaporates", correct: false, diagnosedGap: "Overlooking chemical transformation" },
          { text: "It reacts slowly with CO2 in the air to form shiny Calcium Carbonate (Limestone)", correct: true },
          { text: "It absorbs sunlight like solar cells", correct: false, diagnosedGap: "Photosynthesis cross-contamination" },
          { text: "Bacteria in the mud ferment the lime", correct: false, diagnosedGap: "Biological decomposition confusion" }
        ],
        remedialExplanation: "The wet chuna captures Carbon Dioxide gas directly from village air, slowly turning into a thin layer of hard marble/limestone (CaCO3) that shines in the sun!",
        prerequisiteNode: "chemical_reactivity"
      },
      {
        id: "q3",
        subject: "Biology",
        topic: "Life Processes",
        questionText: "If you place dry raisins (Kishmish) in a bowl of plain well water for 3 hours, why do they swell up?",
        options: [
          { text: "Water moves into the raisins through osmosis because outside water has higher water concentration", correct: true },
          { text: "The raisins undergo cellular division", correct: false, diagnosedGap: "Cell division misconception" },
          { text: "Sugar inside the raisin turns into gas", correct: false, diagnosedGap: "Fermentation misconception" },
          { text: "Gravity pulls water downward into the skins", correct: false, diagnosedGap: "Foundational physics vs biology gap" }
        ],
        remedialExplanation: "The raisin skin acts as a selective net. Water outside is pure and easily rushes inside to balance the thick sweet grape juice inside!",
        prerequisiteNode: "cell_membrane_permeability"
      },
      {
        id: "q4",
        subject: "Mathematics",
        topic: "Quadratic Equations",
        questionText: "To solve the equation x² - 7x + 12 = 0 by splitting the middle term, which two numbers should you choose?",
        options: [
          { text: "+6 and +2", correct: false, diagnosedGap: "Sign multiplication error (+6 × +2 = 12, but sum is +8 not -7)" },
          { text: "-3 and -4", correct: true },
          { text: "+7 and -1", correct: false, diagnosedGap: "Product vs Sum rule confusion" },
          { text: "-6 and -2", correct: false, diagnosedGap: "Addition sign error (-6 + -2 = -8)" }
        ],
        remedialExplanation: "We need two numbers whose product is +12 and whose sum is -7. Since negative times negative equals positive, (-3) × (-4) = +12, and (-3) + (-4) = -7!",
        prerequisiteNode: "negative_integers_arithmetic"
      },
      {
        id: "q5",
        subject: "Physics",
        topic: "Light & Optics",
        questionText: "Why does a wooden stick dipped diagonally into a clear village pond appear bent at the water surface?",
        options: [
          { text: "Water pressure physically bends the wooden fiber", correct: false, diagnosedGap: "Physical deformation misconception" },
          { text: "Light slows down and changes direction as it travels from water to air (Refraction)", correct: true },
          { text: "The stick absorbs blue light from the sky", correct: false, diagnosedGap: "Scattering of light confusion" },
          { text: "Fish in the pond cause water vibrations", correct: false, diagnosedGap: "Acoustics confusion" }
        ],
        remedialExplanation: "Light travels faster in air than in dense water. Just like walking from hard ground into knee-deep mud slows your legs down, light rays bend when leaving water!",
        prerequisiteNode: "speed_of_light_mediums"
      }
    ];

    // Longitudinal Knowledge Graph nodes with prerequisite linkages
    this.knowledgeGraphNodes = [
      { id: "fractions_reciprocal", label: "Fraction Addition & Reciprocals", grade: "Grade 7", status: "gap-detected", parentOf: ["ohm_law_parallel", "ratio_proportion"] },
      { id: "negative_integers_arithmetic", label: "Negative Integer Signs (+/-)", grade: "Grade 7", status: "gap-detected", parentOf: ["quadratic_factoring", "linear_equations"] },
      { id: "speed_of_light_mediums", label: "Wave Speed in Mediums", grade: "Grade 8", status: "mastered", parentOf: ["refraction_lenses"] },
      { id: "chemical_reactivity", label: "Atoms & Conservation of Mass", grade: "Grade 8", status: "mastered", parentOf: ["balancing_equations", "lime_reaction"] },
      { id: "cell_membrane_permeability", label: "Plant Cell & Wall Structure", grade: "Grade 8", status: "in-progress", parentOf: ["osmosis_diffusion", "transpiration"] },
      { id: "ohm_law_parallel", label: "Ohm's Law & Parallel Circuits", grade: "Grade 10", status: "in-progress", parentOf: ["power_heating"] },
      { id: "quadratic_factoring", label: "Quadratic Equations (Splitting Term)", grade: "Grade 10", status: "gap-detected", parentOf: ["board_exam_algebra"] },
      { id: "refraction_lenses", label: "Refraction & Lens Formula", grade: "Grade 10", status: "mastered", parentOf: ["human_eye_defects"] }
    ];
  }

  // 3. Conversational Inference Engine (Socratic Step-by-Step Reasoner)
  async generateResponse(userQuery) {
    const queryLower = userQuery.toLowerCase().trim();
    this.sessionStats.tokensProcessed += Math.max(80, Math.floor(userQuery.length * 1.5));
    this.sessionStats.cachedQueriesServed += 1;
    this.sessionStats.estimatedCostINR = (this.sessionStats.tokensProcessed * 0.00015).toFixed(3);

    // Concept matching algorithm
    let bestMatch = null;
    let maxScore = 0;

    for (const key in this.conceptRepository) {
      const concept = this.conceptRepository[key];
      let score = 0;
      for (const kw of concept.keywords) {
        if (queryLower.includes(kw)) {
          score += 2;
        }
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = concept;
      }
    }

    if (bestMatch && maxScore > 0) {
      const transcreation = bestMatch.transcreations[this.currentLanguage] || 
                            bestMatch.transcreations["hi-IN"] || 
                            bestMatch.transcreations["en-IN"];
      
      return {
        success: true,
        conceptId: bestMatch.id,
        conceptTitle: bestMatch.title,
        analogyName: transcreation.analogyName,
        textResponse: `${transcreation.explanation}\n\n💡 **सोचने का सवाल (Socratic Checkpoint)**:\n${transcreation.socraticPrompt}`,
        socraticQuestion: transcreation.socraticPrompt,
        prerequisiteGap: bestMatch.prerequisiteGap,
        ruralStuckReason: bestMatch.ruralStuckReason,
        tokenEstimate: 160,
        edgeCacheHit: true
      };
    }

    // Dynamic Socratic tutor response for any arbitrary user query
    return this.generateDynamicSocraticScaffold(userQuery);
  }

  // Dynamic Socratic Scaffold when query is outside predefined concept corpus
  generateDynamicSocraticScaffold(query) {
    const isHindi = this.currentLanguage.startsWith("hi");
    const isTelugu = this.currentLanguage.startsWith("te");
    const isMarathi = this.currentLanguage.startsWith("mr");

    if (isHindi) {
      return {
        success: true,
        conceptId: "dynamic_stem",
        conceptTitle: "विज्ञान / गणित समझ (STEM Step-by-Step)",
        analogyName: "दैनिक जीवन का उदाहरण (Real-Life Analogy)",
        textResponse: `नमस्ते! घबराओ मत, तुम्हारा यह सवाल बहुत महत्वपूर्ण है: "${query}".\n\nआइए इसे 3 आसान चरणों में समझते हैं:\n\n1️⃣ **बुनियादी बात**: इसे किसी कठिन किताबी परिभाषा की तरह मत देखो। सोचो कि यह हमारे खेत, घर या बाजार में कैसे काम करता है।\n2️⃣ **गांव का उदाहरण**: जैसे जब साइकिल की चेन ढीली होती है, तो पैडल ज्यादा मारना पड़ता है लेकिन रफ्तार धीमी रहती है—वैसे ही विज्ञान में हर क्रिया का एक सीधा कारण होता है!\n3️⃣ **परीक्षा का सूत्र**: बोर्ड परीक्षा में परीक्षक रटे हुए जवाब पर नहीं, तुम्हारी समझ पर पूरे नंबर देता है।\n\n💡 **मेरा छोटा सा सवाल**: क्या तुम मुझे बता सकते हो कि इस पाठ में तुम्हें सबसे ज्यादा उलझन किस शब्द या संख्या से हो रही है?`,
        socraticQuestion: "क्या तुम मुझे बता सकते हो कि इस पाठ में सबसे ज्यादा उलझन किस बिंदु पर है?",
        prerequisiteGap: "अवधारणा की बुनियादी समझ (Foundational conceptual breakdown needed)",
        tokenEstimate: 185,
        edgeCacheHit: false
      };
    } else if (isTelugu) {
      return {
        success: true,
        conceptId: "dynamic_stem_te",
        conceptTitle: "గ్రామీణ ఉదాహరణతో STEM బోధన",
        analogyName: "రోజువారీ గ్రామీణ పోలిక",
        textResponse: `నమస్కారం! మీ ప్రశ్న: "${query}". భయపడాల్సిన అవసరం లేదు!\n\nదీనిని 3 సాధారణ దశలలో అర్థం చేసుకుందాం:\n1️⃣ **ప్రాథమిక భావన**: పాఠ్యపుస్తకాల్లోని క్లిష్టమైన నిర్వచనాల కంటే మన ఊరిలో జరిగే పనులతో పోల్చి చూద్దాం.\n2️⃣ **గ్రామీణ ఉదాహరణ**: మనం సైకిల్ తొక్కుతున్నప్పుడు లేదా పొలంలో నీటి పారుదల చేసేటప్పుడు జరిగే మార్పుల లాంటిదే ఇది.\n3️⃣ **పరీక్ష చిట్కా**: సూత్రాన్ని బట్టీ పట్టకుండా అర్ధం చేసుకుంటే బోర్డు పరీక్షల్లో సులభంగా మార్కులు సాధించవచ్చు.\n\n💡 **చిన్న ప్రశ్న**: ఇందులో మీకు సరిగ్గా అర్థం కాని భాగం ఏది?`,
        socraticQuestion: "ఇందులో మీకు అర్థం కాని ముఖ్యమైన అంశం ఏది?",
        prerequisiteGap: "ప్రాథమిక విశ్లేషణ అవసరం",
        tokenEstimate: 175,
        edgeCacheHit: false
      };
    } else if (isMarathi) {
      return {
        success: true,
        conceptId: "dynamic_stem_mr",
        conceptTitle: "दैनंदिन उदाहरणासह विज्ञान/गणित",
        analogyName: "गावातील व्यवहारी उदाहरण",
        textResponse: `नमस्कार! तुझा प्रश्न: "${query}". मुळीच घाबरू नकोस!\n\nहे आपण ३ सोप्या पायऱ्यांमध्ये समजून घेऊ:\n1️⃣ **मूळ संकल्पना**: पुस्तकी व्याख्या बाजूला ठेवा आणि आपल्या शेतातील किंवा घरातील उदाहरणाशी जोडून बघा.\n2️⃣ **गावातील उदाहरण**: जसे सायकलच्या चाकात हवा कमी असेल तर पायडल मारताना जास्त ताकद लागते, तसेच विज्ञानात प्रत्येक क्रियेला एक कारण असते.\n3️⃣ **परीक्षेची टीप**: बोर्ड परीक्षेत पाठांतर न करता समजून लिहिणाऱ्याला पैकीच्या पैकी गुण मिळतात!\n\n💡 **माझा प्रश्न**: यात नेमका कोणता शब्द किंवा भाग तुला कठीण वाटतो?`,
        socraticQuestion: "यात नेमका कोणता शब्द किंवा भाग तुला कठीण वाटतो?",
        prerequisiteGap: "संकल्पनात्मक पायऱ्यांची गरज",
        tokenEstimate: 180,
        edgeCacheHit: false
      };
    } else {
      return {
        success: true,
        conceptId: "dynamic_stem_en",
        conceptTitle: "Socratic Vernacular Tutoring Step",
        analogyName: "Everyday Village Mechanical Analogy",
        textResponse: `Hello! Don't worry at all—asking questions is how real learning happens. Let's break down: "${query}".\n\n1️⃣ **The Core Physical Idea**: Strip away the intimidating textbook jargon.\n2️⃣ **Everyday Analogy**: Think of it like adjusting the gears on a bicycle or managing water distribution across farm furrows—every cause has an observable effect.\n3️⃣ **Exam Secret**: State board examiners award full marks for showing the logical steps, not rote paragraph repetition.\n\n💡 **Quick Checkpoint**: Which exact term or step in this problem feels confusing right now?`,
        socraticQuestion: "Which specific word or calculation feels tricky?",
        prerequisiteGap: "Step-by-step conceptual scaffolding recommended",
        tokenEstimate: 160,
        edgeCacheHit: false
      };
    }
  }

  // 4. Diagnostic Quiz Evaluation & Prerequisite Gap Mapping
  evaluateQuizSubmission(answersMap) {
    let score = 0;
    const totalQuestions = this.diagnosticQuiz.length;
    const detectedGaps = [];
    const recommendedRemedials = [];

    this.diagnosticQuiz.forEach(q => {
      const selectedIndex = answersMap[q.id];
      const selectedOption = q.options[selectedIndex];

      if (selectedOption && selectedOption.correct) {
        score++;
      } else if (selectedOption) {
        detectedGaps.push({
          questionId: q.id,
          topic: q.topic,
          diagnosedGap: selectedOption.diagnosedGap || "Conceptual gap",
          prerequisiteNode: q.prerequisiteNode,
          remedialAdvice: q.remedialExplanation
        });

        // Update node status in Knowledge Graph
        const node = this.knowledgeGraphNodes.find(n => n.id === q.prerequisiteNode);
        if (node) {
          node.status = "gap-detected";
          recommendedRemedials.push({
            nodeId: node.id,
            label: node.label,
            grade: node.grade,
            remedialExplanation: q.remedialExplanation
          });
        }
      }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const learningGapClosureEstimate = Math.min(100, Math.round(percentage + 38));

    return {
      score,
      totalQuestions,
      percentage,
      projectedClosureGain: learningGapClosureEstimate,
      detectedGaps,
      recommendedRemedials
    };
  }
}

// Global AI Engine instance
window.regionLearnAI = new RegionLearnAIEngine();
