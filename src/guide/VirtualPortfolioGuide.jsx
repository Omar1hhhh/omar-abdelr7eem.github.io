import React, { useEffect, useReducer, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import './VirtualPortfolioGuide.css';

const GUIDE_COPY = {
  en: {
    greeting: "Welcome to my digital space! I'm Omar's pixel twin. Want me to give you the grand tour, or will you explore on your own?",
    coinHint: 'While you explore, look for 6 hidden coins and tap each one. Find them all to unlock an achievement.',
    guideName: "Omar's pixel twin",
    tourLabel: 'Portfolio tour',
    tourStop: (step, total) => `Tour stop ${step} of ${total}`,
    previous: 'Previous',
    next: 'Next',
    finish: 'Finish',
    endTour: 'End tour',
    achievement: 'Achievement unlocked',
    achievementTitle: 'Master Explorer',
    achievementDescription: 'You found every coin. Thanks for exploring my portfolio.',
    dismiss: 'Dismiss',
    takeTour: 'Take the tour',
    explore: 'Explore on my own',
    coins: 'Coins',
    coinLabel: number => `Collect coin ${number}`,
    coinTitle: 'Collect a coin',
    characterAlt: "Omar's pixel-art portrait",
    closeGuide: 'Close portfolio guide',
    openGuide: 'Open portfolio guide',
    tour: [
      { target: 'hero', title: 'The introduction', description: 'Meet Omar and get a quick overview of what I build.' },
      { target: 'journey', title: 'Journey', description: 'Follow how my interests grew from design and development into intelligent systems.' },
      { target: 'work', title: 'Selected Work', description: 'Explore projects including Super Clinic and LumaSupply.' }
    ]
  },
  ar: {
    greeting: 'أهلًا بيك في مساحتي الرقمية! أنا نسخة عمر بالبكسل. تحب أفرّجك على الموقع، ولا تحب تلف براحتك؟',
    coinHint: 'وأنت بتتفرج، دوّر على ٦ عملات مخفية واجمعهم كلهم عشان تفتح إنجاز.',
    guideName: 'نسخة عمر بالبكسل',
    tourLabel: 'جولة في الموقع',
    tourStop: (step, total) => `محطة ${new Intl.NumberFormat('ar').format(step)} من ${new Intl.NumberFormat('ar').format(total)}`,
    previous: 'السابق',
    next: 'التالي',
    finish: 'إنهاء',
    endTour: 'إنهاء الجولة',
    achievement: 'إنجاز جديد',
    achievementTitle: 'مستكشف محترف',
    achievementDescription: 'جمعت كل العملات! تسلم إنك خدت وقتك واتفرجت على شغلي.',
    dismiss: 'إخفاء',
    takeTour: 'ابدأ الجولة',
    explore: 'استكشف بنفسك',
    coins: 'العملات',
    coinLabel: number => `اجمع العملة ${new Intl.NumberFormat('ar').format(number)}`,
    coinTitle: 'اجمع عملة',
    characterAlt: 'صورة عمر بأسلوب فن البكسل',
    closeGuide: 'إغلاق دليل الموقع',
    openGuide: 'فتح دليل الموقع',
    tour: [
      { target: 'hero', title: 'البداية', description: 'اتعرّف عليّا وخد فكرة سريعة عن الحاجات اللي بشتغل عليها.' },
      { target: 'journey', title: 'رحلتي', description: 'شوف رحلتي من التصميم والتطوير لحد الأنظمة الذكية.' },
      { target: 'work', title: 'شوية من شغلي', description: 'اتفرج على مشاريعي، زي سوبر كلينيك ولوما سبلاي.' }
    ]
  }
};

const ENCOURAGEMENTS = [
  { en: 'Curiosity is a great place to start.', ar: 'الفضول بداية حلوة لأي اكتشاف.' },
  { en: 'Take your time. Good ideas reward a closer look.', ar: 'خد وقتك، الأفكار الحلوة تستاهل تبصلها كويس.' },
  { en: 'Every great product begins with a thoughtful question.', ar: 'كل منتج حلو بيبدأ بسؤال في مكانه.' },
  { en: 'Small details can make a big difference.', ar: 'التفاصيل الصغيرة ساعات بتفرق جدًا.' },
  { en: 'Keep exploring. There is more around the next corner.', ar: 'كمّل لف، لسه فيه حاجات تانية مستنياك.' },
  { en: 'Good design makes the next step feel clear.', ar: 'التصميم الحلو بيخلّي الخطوة الجاية واضحة.' },
  { en: 'A little curiosity can open a whole new path.', ar: 'شوية فضول ممكن يفتحوا لك سكة جديدة.' },
  { en: 'The best experiences make room for discovery.', ar: 'أحلى تجربة هي اللي تسيبلك مساحة تكتشف.' },
  { en: 'Ideas grow stronger when we keep building on them.', ar: 'الفكرة بتقوى كل ما نكمّل نبني عليها.' },
  { en: 'Progress often starts with one simple experiment.', ar: 'التقدم ساعات بيبدأ بتجربة بسيطة.' },
  { en: 'Look closely. There is care in the small things.', ar: 'بص كويس، هتلاقي اهتمام حتى في أصغر التفاصيل.' },
  { en: 'Good work is a series of thoughtful decisions.', ar: 'الشغل الحلو بييجي من قرارات متفكّر فيها.' },
  { en: 'Stay curious about how things work.', ar: 'خليك دايمًا فضولي واعرف الحاجات شغالة إزاي.' },
  { en: 'A clear idea is worth taking the time to shape.', ar: 'الفكرة الواضحة تستاهل تاخد وقتك وتظبطها.' },
  { en: 'The journey matters as much as the finished work.', ar: 'المشوار مهم قد النتيجة بالظبط.' },
  { en: 'Try a different angle. It may reveal a better answer.', ar: 'جرّب تبص من ناحية تانية، يمكن تلاقي حل أحسن.' },
  { en: 'Useful things are built by listening first.', ar: 'الحاجة المفيدة بتبدأ لما نسمع الأول.' },
  { en: 'Keep the people using the product in mind.', ar: 'خلي دايمًا في بالك الناس اللي هتستخدم المنتج.' },
  { en: 'One good question can improve an entire experience.', ar: 'سؤال واحد صح ممكن يحسّن التجربة كلها.' },
  { en: 'There is always something new to learn by making.', ar: 'كل مرة تعمل فيها حاجة، هتتعلم حاجة جديدة.' },
  { en: 'Make it clear, then make it work beautifully.', ar: 'خلّيها واضحة الأول، وبعدها خلّيها شغالة وحلوة.' },
  { en: 'A thoughtful process makes better room for ideas.', ar: 'لما تمشي بخطوات محسوبة، الأفكار بتاخد فرصتها.' },
  { en: 'Stay open to the unexpected solution.', ar: 'خليك متقبل إن الحل ممكن ييجي من حتة مش متوقعة.' },
  { en: 'Every iteration is a chance to make things clearer.', ar: 'كل تعديل فرصة نخلي الحاجة أوضح.' },
  { en: 'The right details make technology feel more human.', ar: 'التفاصيل الصح بتخلّي التكنولوجيا أقرب للناس.' },
  { en: 'Build with purpose. Keep learning along the way.', ar: 'اشتغل لهدف، واتعلم حاجة جديدة في السكة.' },
  { en: 'Good questions lead to more useful solutions.', ar: 'الأسئلة الصح بتوصلنا لحلول أنفع.' },
  { en: 'A calm, clear interface earns trust.', ar: 'الواجهة الهادية والواضحة بتكسب ثقة الناس.' },
  { en: 'The strongest ideas are shaped through practice.', ar: 'أقوى الأفكار بتتظبط بالممارسة.' },
  { en: 'Keep going. Consistency turns plans into progress.', ar: 'كمّل، الاستمرار هو اللي بيحوّل الخطة لنتيجة.' },
  { en: 'Simple is not easy. It is worth working toward.', ar: 'البساطة مش سهلة، بس تستاهل إننا نحاول.' },
  { en: 'There is a lesson in every challenge.', ar: 'كل تحدي وراه درس نتعلمه.' },
  { en: 'Good work begins with understanding the real need.', ar: 'الشغل الصح بيبدأ لما نفهم الاحتياج بجد.' },
  { en: 'Stay patient with the process of getting better.', ar: 'خليك صبور، التحسن بياخد وقته.' },
  { en: 'Explore the details, then see the bigger picture.', ar: 'اكتشف التفاصيل الأول، وبعدها بص للصورة الكبيرة.' },
  { en: 'A useful feature solves a real problem.', ar: 'الميزة المفيدة هي اللي بتحل مشكلة حقيقية.' },
  { en: 'Progress is built one considered step at a time.', ar: 'التقدم بيتبني خطوة بخطوة وبتركيز.' },
  { en: 'Thoughtful design respects your time and attention.', ar: 'التصميم المدروس بيحترم وقتك وتركيزك.' },
  { en: 'Keep asking how this could work better.', ar: 'فضل اسأل نفسك: إزاي نخليها أحسن؟' },
  { en: 'The best next step is often the clearest one.', ar: 'غالبًا أحسن خطوة جاية هي أوضح خطوة.' },
  { en: 'A fresh perspective can change the whole approach.', ar: 'وجهة نظر جديدة ممكن تغيّر طريقة الحل كلها.' },
  { en: 'Build, learn, refine. Then do it again.', ar: 'ابني واتعلم وحسّن، وارجع كررها تاني.' },
  { en: 'Careful work makes complex things easier to use.', ar: 'الشغل المتقن بيخلّي الحاجات المعقدة أسهل.' },
  { en: 'Every project is a chance to make something meaningful.', ar: 'كل مشروع فرصة نعمل حاجة ليها معنى.' },
  { en: 'Stay focused on what helps people most.', ar: 'ركّز على الحاجة اللي هتفيد الناس بجد.' },
  { en: 'Good ideas become real through steady effort.', ar: 'الأفكار الحلوة بتبقى حقيقة بالمجهود والاستمرار.' },
  { en: 'Take a moment to notice how far an idea can go.', ar: 'خد لحظة وشوف الفكرة ممكن توصل لفين.' },
  { en: 'Let the problem guide the tools you choose.', ar: 'خلّي المشكلة هي اللي تحدد الأدوات اللي هتستخدمها.' },
  { en: 'Make room for learning at every stage.', ar: 'سيب مساحة للتعلّم في كل خطوة.' },
  { en: 'Thanks for taking a closer look at my work.', ar: 'مبسوط إنك أخدت وقتك واتفرجت على شغلي.' }
];

const MESSAGES_PER_VISIT = 5;
const ENCOURAGEMENT_INTERVAL = 20_000;
const ENCOURAGEMENT_VISIBLE_DURATION = 6_000;

function createVisitMessageSequence() {
  const sequence = Array.from({ length: ENCOURAGEMENTS.length }, (_, index) => index);
  for (let index = sequence.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [sequence[index], sequence[swapIndex]] = [sequence[swapIndex], sequence[index]];
  }
  return sequence.slice(0, MESSAGES_PER_VISIT);
}

const COINS = [
  { id: 'hero-coin', section: 'hero', top: '27%', side: 'right', offset: '12%' },
  { id: 'about-coin', section: 'about', top: '39%', side: 'left', offset: '13%' },
  { id: 'skills-coin', section: 'skills', top: '61%', side: 'right', offset: '16%' },
  { id: 'journey-coin', section: 'journey', top: '73%', side: 'right', offset: '11%' },
  { id: 'work-coin', section: 'work', top: '24%', side: 'left', offset: '10%' },
  { id: 'contact-coin', section: 'contact', top: '46%', side: 'left', offset: '12%' }
];

const initialCoinProgress = { coinsCollected: 0, collectedIds: new Set() };
const FINAL_COIN_DELAY = 90_000;

function coinProgressReducer(state, action) {
  if (state.collectedIds.has(action.id)) return state;

  const collectedIds = new Set(state.collectedIds);
  collectedIds.add(action.id);

  return {
    coinsCollected: collectedIds.size,
    collectedIds
  };
}

function PixelCharacter({ alt }) {
  return (
    <img
      className="pixel-guide__portrait"
      src={`${import.meta.env.BASE_URL}images/omar-pixel-guide.png`}
      alt={alt}
      width="560"
      height="680"
    />
  );
}

function TypewriterText({ text, reduceMotion }) {
  const characters = Array.from(text);
  const [visibleCharacters, setVisibleCharacters] = useState(
    reduceMotion ? characters.length : 0
  );

  useEffect(() => {
    if (reduceMotion) {
      setVisibleCharacters(characters.length);
      return undefined;
    }

    let count = 0;
    setVisibleCharacters(0);
    const timer = window.setInterval(() => {
      count += 1;
      setVisibleCharacters(count);
      if (count >= characters.length) window.clearInterval(timer);
    }, 22);

    return () => window.clearInterval(timer);
  }, [text, reduceMotion, characters.length]);

  return (
    <span className="pixel-guide__typed-text" aria-label={text}>
      <span aria-hidden="true">{characters.slice(0, visibleCharacters).join('')}</span>
    </span>
  );
}

function Coin({ coin, number, language, collected, onCollect, reduceMotion }) {
  const [isPopping, setIsPopping] = useState(false);
  const collectTimeout = useRef(null);

  useEffect(() => () => {
    if (collectTimeout.current !== null) window.clearTimeout(collectTimeout.current);
  }, []);

  return (
    <AnimatePresence>
      {!collected && (
        <motion.button
          key={coin.id}
          type="button"
          className="pixel-guide__coin"
          style={{
            top: coin.top,
            [coin.side]: coin.offset
          }}
          aria-label={GUIDE_COPY[language].coinLabel(number)}
          title={GUIDE_COPY[language].coinTitle}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.7 }}
          animate={isPopping
            ? { opacity: 0, scale: 1.7, rotate: 150, y: 0 }
            : { opacity: 1, scale: 1, rotate: 0, y: reduceMotion ? 0 : [0, -3, 0] }}
          exit={{ opacity: 0, scale: 0.3 }}
          transition={isPopping
            ? { duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }
            : { duration: reduceMotion ? 0 : 1.8, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
          whileHover={reduceMotion ? undefined : { y: -3, scale: 1.08 }}
          whileTap={reduceMotion ? undefined : { scale: 0.92 }}
          onClick={() => {
            if (isPopping) return;
            setIsPopping(true);
            collectTimeout.current = window.setTimeout(
              () => onCollect(coin.id),
              reduceMotion ? 0 : 260
            );
          }}
        >
          <span className="pixel-guide__coin-glyph" aria-hidden="true">
            <span className="pixel-guide__coin-glyph-inner" />
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function PixelPanel({ children, className = '', label, language }) {
  return (
    <motion.section
      className={`pixel-guide__panel ${className}`}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      lang={language}
      role="dialog"
      aria-label={label}
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.section>
  );
}

export function VirtualPortfolioGuide() {
  const reduceMotion = useReducedMotion();
  const [language, setLanguage] = useState(() => document.documentElement.lang === 'ar' ? 'ar' : 'en');
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);
  const [showInitialDialog, setShowInitialDialog] = useState(true);
  const [coinProgress, dispatchCoin] = useReducer(coinProgressReducer, initialCoinProgress);
  const [showAchievement, setShowAchievement] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [encouragementIndex, setEncouragementIndex] = useState(0);
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [visitMessageSequence] = useState(createVisitMessageSequence);
  const [finalCoinUnlocked, setFinalCoinUnlocked] = useState(false);
  const messageCursor = useRef(0);
  const { coinsCollected, collectedIds } = coinProgress;
  const firstFiveCoinsCollected = COINS.slice(0, 5).every(coin => collectedIds.has(coin.id));
  const copy = GUIDE_COPY[language];
  const activeStep = copy.tour[currentTourStep];
  const achievementVisible = coinsCollected === COINS.length && showAchievement;
  const canShowEncouragement = !showInitialDialog && !isTourActive && !achievementVisible;

  useEffect(() => {
    const handleLanguageChange = event => {
      const nextLanguage = event.detail?.lang;
      if (nextLanguage === 'ar' || nextLanguage === 'en') setLanguage(nextLanguage);
    };

    window.addEventListener('portfolio:language-change', handleLanguageChange);
    return () => window.removeEventListener('portfolio:language-change', handleLanguageChange);
  }, []);

  useEffect(() => {
    if (!canShowEncouragement) {
      setShowEncouragement(false);
      return undefined;
    }

    let showTimer;
    let hideTimer;
    let nextTimer;

    const showNextMessage = () => {
      if (messageCursor.current >= visitMessageSequence.length) return;
      setEncouragementIndex(visitMessageSequence[messageCursor.current]);
      messageCursor.current += 1;
      setShowEncouragement(true);
      hideTimer = window.setTimeout(() => {
        setShowEncouragement(false);
        nextTimer = window.setTimeout(
          showNextMessage,
          ENCOURAGEMENT_INTERVAL - ENCOURAGEMENT_VISIBLE_DURATION
        );
      }, ENCOURAGEMENT_VISIBLE_DURATION);
    };

    showTimer = window.setTimeout(showNextMessage, 5000);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
      window.clearTimeout(nextTimer);
    };
  }, [canShowEncouragement, visitMessageSequence]);

  useEffect(() => {
    if (!firstFiveCoinsCollected || finalCoinUnlocked) return undefined;

    const unlockTimer = window.setTimeout(() => setFinalCoinUnlocked(true), FINAL_COIN_DELAY);
    return () => window.clearTimeout(unlockTimer);
  }, [finalCoinUnlocked, firstFiveCoinsCollected]);

  useEffect(() => {
    if (!isTourActive) return undefined;

    const target = document.getElementById(activeStep.target);
    if (!target) {
      console.error(`The portfolio tour target "#${activeStep.target}" could not be found.`);
      return undefined;
    }

    target.setAttribute('data-pixel-guide-active', 'true');
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'center'
    });

    return () => target.removeAttribute('data-pixel-guide-active');
  }, [activeStep.target, isTourActive, reduceMotion]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (event.key !== 'Escape') return;
      if (isTourActive) setIsTourActive(false);
      setShowInitialDialog(false);
      setIsMinimized(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive]);

  function startTour() {
    setCurrentTourStep(0);
    setShowInitialDialog(false);
    setIsMinimized(false);
    setIsTourActive(true);
  }

  function endTour() {
    setIsTourActive(false);
    setShowInitialDialog(false);
    setIsMinimized(false);
  }

  const panelVisible = !isMinimized && (isTourActive || showInitialDialog || achievementVisible);

  return (
    <>
      {isTourActive && (
        <motion.div
          className="pixel-guide__scrim"
          aria-hidden="true"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
        />
      )}

      <>
        {COINS.map((coin, index) => {
          if (index === COINS.length - 1 && !finalCoinUnlocked) return null;

          const section = document.getElementById(coin.section);
          if (!section) return null;

          return createPortal(
            <Coin
              coin={coin}
              number={index + 1}
              language={language}
              collected={collectedIds.has(coin.id)}
              onCollect={id => dispatchCoin({ id })}
              reduceMotion={reduceMotion}
              key={coin.id}
            />,
            section,
            coin.id
          );
        })}
      </>

      <div className="pixel-guide__tracker" aria-live="polite" dir={language === 'ar' ? 'rtl' : 'ltr'} lang={language}>
        <span className="pixel-guide__coin-glyph" aria-hidden="true">
          <span className="pixel-guide__coin-glyph-inner" />
        </span>
        <span>{copy.coins}: {new Intl.NumberFormat(language).format(coinsCollected)}/{new Intl.NumberFormat(language).format(COINS.length)}</span>
      </div>

      <div
        className={`pixel-guide ${isTourActive ? 'pixel-guide--touring' : ''}`}
        dir="ltr"
      >
        {showEncouragement && canShowEncouragement && (
          <motion.aside
            key={`${language}-${encouragementIndex}`}
            className="pixel-guide__encouragement"
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            lang={language}
            aria-live="polite"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeOut' }}
          >
            <span className="pixel-guide__encouragement-label">{copy.guideName}</span>
            <p>{ENCOURAGEMENTS[encouragementIndex][language]}</p>
            <button
              className="pixel-guide__encouragement-dismiss"
              type="button"
              onClick={() => setShowEncouragement(false)}
            >
              {copy.dismiss}
            </button>
          </motion.aside>
        )}

        {panelVisible && (
          <PixelPanel
            className={isTourActive ? 'pixel-guide__panel--tour' : ''}
            label={isTourActive ? `${copy.tourLabel}: ${activeStep.title}` : copy.guideName}
            language={language}
          >
              {isTourActive ? (
                <>
                  <p className="pixel-guide__eyebrow">
                    {copy.tourStop(currentTourStep + 1, copy.tour.length)}
                  </p>
                  <h2>{activeStep.title}</h2>
                  <p className="pixel-guide__description">{activeStep.description}</p>
                  <div className="pixel-guide__controls">
                    <button
                      className="pixel-guide__button pixel-guide__button--quiet"
                      type="button"
                      disabled={currentTourStep === 0}
                      onClick={() => setCurrentTourStep(step => Math.max(0, step - 1))}
                    >
                      {copy.previous}
                    </button>
                    <button
                      className="pixel-guide__button"
                      type="button"
                      onClick={() => {
                        if (currentTourStep === copy.tour.length - 1) endTour();
                        else setCurrentTourStep(step => step + 1);
                      }}
                    >
                      {currentTourStep === copy.tour.length - 1 ? copy.finish : copy.next}
                    </button>
                    <button className="pixel-guide__text-button" type="button" onClick={endTour}>
                      {copy.endTour}
                    </button>
                  </div>
                </>
              ) : achievementVisible ? (
                <>
                  <p className="pixel-guide__eyebrow">{copy.achievement}</p>
                  <h2>{copy.achievementTitle}</h2>
                  <p className="pixel-guide__description">{copy.achievementDescription}</p>
                  <button
                    className="pixel-guide__text-button pixel-guide__dismiss"
                    type="button"
                    onClick={() => setShowAchievement(false)}
                  >
                    {copy.dismiss}
                  </button>
                </>
              ) : (
                <>
                  <p className="pixel-guide__eyebrow">{copy.guideName}</p>
                  <p className="pixel-guide__greeting">
                    <TypewriterText text={copy.greeting} reduceMotion={reduceMotion} />
                  </p>
                  <p className="pixel-guide__coin-hint">{copy.coinHint}</p>
                  <div className="pixel-guide__controls pixel-guide__welcome-controls">
                    <button className="pixel-guide__button" type="button" onClick={startTour}>
                      {copy.takeTour}
                    </button>
                    <button
                      className="pixel-guide__button pixel-guide__button--quiet"
                      type="button"
                      onClick={() => {
                        setShowInitialDialog(false);
                        setIsMinimized(true);
                      }}
                    >
                      {copy.explore}
                    </button>
                  </div>
                </>
              )}
          </PixelPanel>
        )}

        <button
          className="pixel-guide__character-button"
          type="button"
          aria-label={panelVisible ? copy.closeGuide : copy.openGuide}
          aria-expanded={panelVisible}
          onClick={() => {
            if (panelVisible) {
              if (isTourActive) endTour();
              else {
                setShowInitialDialog(false);
                setShowAchievement(false);
                setIsMinimized(true);
              }
              return;
            }

            setShowInitialDialog(true);
            setIsMinimized(false);
          }}
        >
          <PixelCharacter alt={copy.characterAlt} />
        </button>
      </div>
    </>
  );
}
