import type { LearningPath } from "@/lib/types";

/** Five mini-courses. Each lesson = short text + interactive diagram + 3-question quiz. */
export const LEARNING_PATHS: LearningPath[] = [
  {
    id: "solar-system-10",
    title: "The Solar System in 10 Minutes",
    description: "Meet the Sun, the planets and the small worlds in between — and get a real feel for how big and empty it all is.",
    level: "Beginner",
    icon: "Orbit",
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #E0F2FE 100%)",
    badge: { id: "badge-grand-tour", name: "Grand Tour", description: "Completed The Solar System in 10 Minutes" },
    lessons: [
      {
        id: "neighborhood",
        title: "Our cosmic neighborhood",
        minutes: 3,
        summary: "One star, eight planets, and a lot of leftovers.",
        body: [
          "Our solar system formed about **4.6 billion years ago** from a spinning cloud of gas and dust. Most of the material fell to the center and became the **Sun**, which holds 99.86% of all the mass.",
          "The leftover disk clumped into planets. Close to the hot young Sun, only rock and metal could survive, forming the four **rocky planets**: Mercury, Venus, Earth and Mars.",
          "Farther out, past the **frost line**, ice was plentiful too. Planets there grew big enough to grab huge amounts of hydrogen and helium, becoming the **giant planets**: Jupiter, Saturn, Uranus and Neptune.",
        ],
        diagram: "planet-order",
        diagramCaption: "Tap each planet to see where it sits. Notice the gap between the rocky and giant planets — that's where the asteroid belt lives.",
        quiz: [
          {
            question: "Roughly how much of the solar system's mass is in the Sun?",
            options: ["About 50%", "About 75%", "Over 99%", "About 10%"],
            answerIndex: 2,
            explanation: "The Sun holds about 99.86% of the mass. Everything else — planets, moons, asteroids — is the remaining sliver.",
          },
          {
            question: "Why are the inner planets rocky?",
            options: [
              "They're older than the outer planets",
              "Near the hot young Sun, only rock and metal could stay solid",
              "The Sun's gravity pulled the gas off them yesterday",
              "Rocks are attracted to light",
            ],
            answerIndex: 1,
            explanation: "Close to the Sun it was too warm for ices to survive, so only rock and metal were available to build planets.",
          },
          {
            question: "Which of these is a giant planet?",
            options: ["Mars", "Venus", "Uranus", "Mercury"],
            answerIndex: 2,
            explanation: "Uranus is an 'ice giant'. Jupiter and Saturn are 'gas giants'. Mars, Venus and Mercury are rocky.",
          },
        ],
      },
      {
        id: "scale",
        title: "Why everything is so far apart",
        minutes: 4,
        summary: "Space is mostly… space.",
        body: [
          "Pictures of the solar system squeeze the planets together so they fit on a page. In reality, the distances are enormous compared to the sizes.",
          "If the Sun were a **basketball**, Earth would be a **peppercorn about 26 meters away**. Jupiter would be a grape-sized ball 134 meters away, and Neptune a small marble almost 780 meters away.",
          "Light — the fastest thing there is — takes **8 minutes** to reach Earth from the Sun and over **4 hours** to reach Neptune.",
        ],
        diagram: "scale-walk",
        diagramCaption: "Drag the slider to 'walk' outward from a basketball-sized Sun.",
        quiz: [
          {
            question: "If the Sun were a basketball, Earth would be about…",
            options: ["A beach ball next to it", "A peppercorn 26 m away", "A grape 2 m away", "A marble 1 km away"],
            answerIndex: 1,
            explanation: "Earth is about 109 times smaller than the Sun and about 107 Sun-widths away.",
          },
          {
            question: "How long does sunlight take to reach Earth?",
            options: ["Instantly", "About 8 seconds", "About 8 minutes", "About 8 hours"],
            answerIndex: 2,
            explanation: "Light covers the ~150 million km in about 8 minutes 20 seconds.",
          },
          {
            question: "Why are most solar-system diagrams 'wrong'?",
            options: [
              "Scientists don't know the distances",
              "Planets would be too small to see if distances were drawn to scale",
              "The planets move too fast",
              "It's illegal to draw space to scale",
            ],
            answerIndex: 1,
            explanation: "At true scale, the planets shrink to specks. Diagrams trade accurate distances for visibility.",
          },
        ],
      },
      {
        id: "small-worlds",
        title: "Dwarf planets, asteroids and comets",
        minutes: 3,
        summary: "The solar system's leftovers tell its story.",
        body: [
          "Between Mars and Jupiter lies the **asteroid belt** — millions of rocky bodies, but so spread out that spacecraft cross it easily. Its largest member is the dwarf planet **Ceres**.",
          "Beyond Neptune is the **Kuiper Belt**, a ring of icy worlds including **Pluto**, Haumea and Makemake. Even farther out, comets may come from a vast spherical shell called the **Oort Cloud**.",
          "A **dwarf planet** orbits the Sun and is round, but hasn't cleared its orbit of other debris. That's why Pluto was reclassified in 2006.",
        ],
        diagram: "planet-order",
        diagramCaption: "Toggle the belts on to see where small worlds gather.",
        quiz: [
          {
            question: "What's the main reason Pluto isn't classified as a planet?",
            options: ["It's too cold", "It hasn't cleared its orbit of other objects", "It has no moons", "It isn't round"],
            answerIndex: 1,
            explanation: "Pluto is round and orbits the Sun, but it shares its region with many other Kuiper Belt objects.",
          },
          {
            question: "Where is the asteroid belt?",
            options: ["Between Earth and Mars", "Between Mars and Jupiter", "Beyond Neptune", "Around Saturn"],
            answerIndex: 1,
            explanation: "The main belt sits between Mars and Jupiter.",
          },
          {
            question: "Which is the largest object in the asteroid belt?",
            options: ["Vesta", "Ceres", "Eros", "Pluto"],
            answerIndex: 1,
            explanation: "Ceres, about 940 km across, is big enough to be a dwarf planet.",
          },
        ],
      },
    ],
  },
  {
    id: "stars-born",
    title: "How Stars Are Born",
    description: "Follow a star from a cold, dark cloud to a blazing sun — and see how it ends.",
    level: "Beginner",
    icon: "Sparkles",
    gradient: "linear-gradient(135deg, #FCE7F3 0%, #E0E7FF 100%)",
    badge: { id: "badge-stellar-nursery", name: "Stellar Nursery", description: "Completed How Stars Are Born" },
    lessons: [
      {
        id: "clouds",
        title: "Clouds that collapse",
        minutes: 3,
        summary: "Stars begin in cold, dusty nebulae.",
        body: [
          "Stars form inside **molecular clouds** — cold, dense regions of gas and dust, often many light-years across. They're mostly hydrogen, at temperatures around −260 °C.",
          "When part of a cloud gets dense enough — perhaps nudged by a nearby supernova — **gravity** wins over the gas's pressure and the clump starts to collapse.",
          "As it shrinks, it spins faster and flattens into a disk, with a hot, dense **protostar** growing at the center.",
        ],
        diagram: "nebula-collapse",
        diagramCaption: "Drag the slider to let gravity pull the cloud together.",
        quiz: [
          {
            question: "What force starts the collapse of a gas cloud into a star?",
            options: ["Magnetism", "Gravity", "Friction", "Electricity"],
            answerIndex: 1,
            explanation: "Gravity pulls the gas inward once a region is dense enough to overcome its internal pressure.",
          },
          {
            question: "Why does a collapsing cloud flatten into a disk?",
            options: ["It spins faster as it shrinks", "Light pushes it flat", "It hits other stars", "It cools down"],
            answerIndex: 0,
            explanation: "Like a spinning ice-skater pulling in their arms, the cloud spins faster as it shrinks, flattening into a disk.",
          },
          {
            question: "What are star-forming clouds mostly made of?",
            options: ["Iron", "Oxygen", "Hydrogen", "Carbon dioxide"],
            answerIndex: 2,
            explanation: "Hydrogen is the most common element in the universe and the main ingredient of stars.",
          },
        ],
      },
      {
        id: "ignition",
        title: "Ignition: fusion turns on",
        minutes: 3,
        summary: "A star is a balancing act between gravity and fusion.",
        body: [
          "As the protostar contracts, its core heats up. At about **10 million °C**, hydrogen nuclei slam together hard enough to fuse into helium, releasing energy. A star is born.",
          "Now the star is in **balance**: gravity squeezes inward, and the energy from fusion pushes outward. This stable phase is called the **main sequence**. Our Sun has been in it for 4.6 billion years.",
          "A star's **mass** decides everything: heavy stars burn hot, blue and fast; small stars burn cool, red and can last for trillions of years.",
        ],
        diagram: "star-lifecycle",
        diagramCaption: "Pick a star mass and step through its life.",
        quiz: [
          {
            question: "What two forces are balanced in a main-sequence star?",
            options: ["Gravity and fusion pressure", "Magnetism and spin", "Light and darkness", "Heat and cold"],
            answerIndex: 0,
            explanation: "Gravity pulls in; the energy from fusion pushes out. Balance keeps the star stable.",
          },
          {
            question: "Which stars live the longest?",
            options: ["The most massive", "The smallest", "Blue ones", "All live the same time"],
            answerIndex: 1,
            explanation: "Small red dwarfs use their fuel slowly and can shine for trillions of years.",
          },
          {
            question: "In the core, hydrogen fuses into…",
            options: ["Carbon", "Helium", "Iron", "Oxygen"],
            answerIndex: 1,
            explanation: "Main-sequence stars fuse hydrogen into helium in their cores.",
          },
        ],
      },
      {
        id: "endings",
        title: "How stars end",
        minutes: 4,
        summary: "White dwarfs, neutron stars and black holes.",
        body: [
          "When a Sun-like star runs low on hydrogen in its core, it swells into a **red giant**, then gently sheds its outer layers as a glowing **planetary nebula**. The leftover core becomes a **white dwarf** about the size of Earth.",
          "Stars more than about **8 times the Sun's mass** end violently. Their cores collapse in a fraction of a second, triggering a **supernova** that can outshine an entire galaxy.",
          "What's left is a **neutron star** — a city-sized ball denser than an atomic nucleus — or, for the heaviest stars, a **black hole**. The elements blasted out seed the next generation of stars and planets — including the iron in your blood.",
        ],
        diagram: "star-lifecycle",
        diagramCaption: "Compare the endings of a Sun-like star and a massive star.",
        quiz: [
          {
            question: "What will our Sun eventually become?",
            options: ["A black hole", "A neutron star", "A white dwarf", "A supernova"],
            answerIndex: 2,
            explanation: "The Sun isn't massive enough to go supernova; it will end as a white dwarf in about 5 billion years.",
          },
          {
            question: "Roughly how massive must a star be to end in a supernova?",
            options: ["Any size", "About 8 times the Sun or more", "Half the Sun", "Exactly the Sun's mass"],
            answerIndex: 1,
            explanation: "Stars above roughly 8 solar masses collapse and explode as core-collapse supernovae.",
          },
          {
            question: "Where did the iron in your blood come from?",
            options: ["Earth's core", "Inside ancient stars and stellar explosions", "The Moon", "Comets only"],
            answerIndex: 1,
            explanation: "Heavy elements were forged in stars and scattered by stellar explosions before our solar system formed.",
          },
        ],
      },
    ],
  },
  {
    id: "seasons",
    title: "Why Seasons Happen",
    description: "It's not about distance from the Sun. Discover the real reason — Earth's tilt.",
    level: "Beginner",
    icon: "Sun",
    gradient: "linear-gradient(135deg, #FFEDD5 0%, #FCE7F3 100%)",
    badge: { id: "badge-equinox", name: "Equinox Explorer", description: "Completed Why Seasons Happen" },
    lessons: [
      {
        id: "myth",
        title: "The distance myth",
        minutes: 3,
        summary: "Earth is actually closest to the Sun in January.",
        body: [
          "Many people think summer happens when Earth is closer to the Sun. But Earth's orbit is almost a perfect circle — its distance varies by only about **3%**.",
          "In fact, Earth is **closest to the Sun in early January**, during the Northern Hemisphere's winter.",
          "And if distance caused seasons, both hemispheres would have summer at the same time. Instead, when it's summer in Canada, it's winter in Australia.",
        ],
        diagram: "seasons",
        diagramCaption: "Move Earth around its orbit. Watch the distance barely change — but the sunlight angle changes a lot.",
        quiz: [
          {
            question: "When is Earth closest to the Sun?",
            options: ["Late June", "Early January", "March", "September"],
            answerIndex: 1,
            explanation: "Perihelion happens in early January each year.",
          },
          {
            question: "What proves distance doesn't cause seasons?",
            options: [
              "The Moon has seasons",
              "The two hemispheres have opposite seasons at the same time",
              "Summer is always hot",
              "The Sun changes color",
            ],
            answerIndex: 1,
            explanation: "If distance mattered most, the whole planet would have summer together.",
          },
          {
            question: "Earth's distance from the Sun varies by about…",
            options: ["3%", "30%", "50%", "300%"],
            answerIndex: 0,
            explanation: "Earth's orbit is nearly circular, so its distance changes by only about 3%.",
          },
        ],
      },
      {
        id: "tilt",
        title: "It's all about the tilt",
        minutes: 4,
        summary: "A 23.4° lean changes everything.",
        body: [
          "Earth's axis is tilted by **23.4°**, and it always points the same way in space (toward Polaris) as we orbit.",
          "For half the year the Northern Hemisphere leans **toward** the Sun. Sunlight hits it more directly — concentrating energy on a smaller area — and days are longer. That's summer.",
          "Six months later it leans **away**: sunlight arrives at a low angle, spreading out over more ground, and days are short. That's winter.",
        ],
        diagram: "seasons",
        diagramCaption: "Try setting the tilt to 0° — what happens to the seasons?",
        quiz: [
          {
            question: "How much is Earth's axis tilted?",
            options: ["0°", "About 23.4°", "45°", "90°"],
            answerIndex: 1,
            explanation: "Earth's axial tilt (obliquity) is about 23.4°.",
          },
          {
            question: "Why does direct sunlight warm the ground more?",
            options: [
              "It's closer to the Sun",
              "Its energy is concentrated on a smaller area",
              "It's a different color",
              "It moves faster",
            ],
            answerIndex: 1,
            explanation: "Low-angle light spreads over a larger area, so each square meter gets less energy.",
          },
          {
            question: "With zero tilt, Earth would have…",
            options: ["Extreme seasons", "Almost no seasons", "Two summers a year", "Permanent winter everywhere"],
            answerIndex: 1,
            explanation: "Without tilt, sunlight angles would stay the same all year, so seasons would nearly vanish.",
          },
        ],
      },
      {
        id: "solstices",
        title: "Solstices, equinoxes and day length",
        minutes: 3,
        summary: "The calendar's turning points.",
        body: [
          "The **June solstice** (around June 21) is when the North Pole leans most toward the Sun — the longest day in the Northern Hemisphere.",
          "At the **equinoxes** (around March 20 and September 22), neither pole leans toward the Sun, and day and night are nearly equal everywhere.",
          "Near the poles the effect is extreme: there, the summer Sun can stay up for **24 hours**, and in winter it may not rise at all.",
        ],
        diagram: "day-length",
        diagramCaption: "Pick a latitude and date to see how many hours of daylight you'd get.",
        quiz: [
          {
            question: "The longest day in the Northern Hemisphere is the…",
            options: ["March equinox", "June solstice", "September equinox", "December solstice"],
            answerIndex: 1,
            explanation: "The June solstice gives the Northern Hemisphere its longest day.",
          },
          {
            question: "At an equinox, day and night are…",
            options: ["Nearly equal everywhere", "24 hours of day everywhere", "Longest at the equator only", "Unrelated to the Sun"],
            answerIndex: 0,
            explanation: "'Equinox' means 'equal night'.",
          },
          {
            question: "Where can the Sun stay up for 24 hours?",
            options: ["At the equator", "Near the poles in summer", "Only in Australia", "Nowhere on Earth"],
            answerIndex: 1,
            explanation: "Inside the Arctic and Antarctic circles you get the 'midnight sun' in summer.",
          },
        ],
      },
    ],
  },
  {
    id: "black-holes",
    title: "Black Holes Explained",
    description: "What they are, how we know they're real, and what would happen if you fell in.",
    level: "Intermediate",
    icon: "CircleDot",
    gradient: "linear-gradient(135deg, #E0E7FF 0%, #FCE7F3 100%)",
    badge: { id: "badge-event-horizon", name: "Event Horizon", description: "Completed Black Holes Explained" },
    lessons: [
      {
        id: "what",
        title: "What is a black hole?",
        minutes: 4,
        summary: "Gravity so strong that light can't escape.",
        body: [
          "A black hole is a region where so much mass is packed into so little space that nothing — not even light — can escape once it crosses a boundary called the **event horizon**.",
          "Every object has an **escape velocity**: Earth's is 11.2 km/s. Squeeze any mass small enough and its escape velocity exceeds the speed of light. Squeeze Earth to the size of a marble (~9 mm) and it would become a black hole.",
          "Black holes aren't cosmic vacuum cleaners. From far away, a black hole's gravity is the same as any object of equal mass. If the Sun became a black hole, Earth would keep orbiting normally (but it would get very cold).",
        ],
        diagram: "black-hole",
        diagramCaption: "Shrink an object and watch its escape velocity climb toward light speed.",
        quiz: [
          {
            question: "What is the event horizon?",
            options: [
              "The black hole's solid surface",
              "The boundary beyond which nothing can escape",
              "A ring of glowing gas",
              "The center point of the black hole",
            ],
            answerIndex: 1,
            explanation: "The event horizon is a boundary, not a surface — once inside, escape is impossible.",
          },
          {
            question: "If the Sun turned into a black hole of the same mass, Earth would…",
            options: ["Get sucked in", "Keep orbiting normally", "Fly off into space", "Explode"],
            answerIndex: 1,
            explanation: "Gravity depends on mass and distance; the mass wouldn't change, so the orbit wouldn't either.",
          },
          {
            question: "To become a black hole, Earth would need to be squeezed to about the size of…",
            options: ["A city", "A football field", "A marble", "The Moon"],
            answerIndex: 2,
            explanation: "Earth's Schwarzschild radius is about 9 mm.",
          },
        ],
      },
      {
        id: "evidence",
        title: "How we know they're real",
        minutes: 3,
        summary: "Stars, waves and the first image.",
        body: [
          "We can't see black holes directly, but we see their effects. Astronomers tracked stars whipping around an invisible object at the center of our galaxy — **Sagittarius A***, about 4 million times the Sun's mass. That work won the 2020 Nobel Prize.",
          "In 2015, **LIGO** detected **gravitational waves** — ripples in spacetime — from two black holes merging over a billion light-years away.",
          "In 2019, the **Event Horizon Telescope** released the first image of a black hole's shadow, in galaxy M87. In 2022 it imaged Sagittarius A*.",
        ],
        diagram: "light-bending",
        diagramCaption: "Move the light ray closer to see how gravity bends its path.",
        quiz: [
          {
            question: "What is Sagittarius A*?",
            options: ["A nearby star", "The supermassive black hole at our galaxy's center", "A constellation", "A space telescope"],
            answerIndex: 1,
            explanation: "Sgr A* is the ~4-million-solar-mass black hole at the Milky Way's center.",
          },
          {
            question: "What did LIGO detect in 2015?",
            options: ["A new planet", "Gravitational waves from merging black holes", "Dark matter", "Light from the Big Bang"],
            answerIndex: 1,
            explanation: "LIGO's first detection, GW150914, came from two merging black holes.",
          },
          {
            question: "The first image of a black hole's shadow (2019) was of…",
            options: ["Sagittarius A*", "M87*", "Cygnus X-1", "The Sun"],
            answerIndex: 1,
            explanation: "The Event Horizon Telescope imaged M87* first, then Sgr A* in 2022.",
          },
        ],
      },
      {
        id: "falling-in",
        title: "Falling in",
        minutes: 3,
        summary: "Spaghettification, frozen time and open questions.",
        body: [
          "Near a small black hole, the pull on your feet would be much stronger than on your head, stretching you thin — physicists really call this **spaghettification**.",
          "To a distant observer, you'd appear to slow down and redden as you approached the horizon, seeming to freeze there. This is **gravitational time dilation**.",
          "What happens at the very center is **unknown**. General relativity predicts a 'singularity', but most physicists think a theory of quantum gravity is needed to describe it. It's one of the biggest open questions in science.",
        ],
        diagram: "black-hole",
        diagramCaption: "Notice how the tidal stretch depends on the black hole's mass.",
        quiz: [
          {
            question: "What is spaghettification caused by?",
            options: ["Heat", "Tidal forces — gravity much stronger at your feet than your head", "Magnetic fields", "Friction"],
            answerIndex: 1,
            explanation: "The difference in gravitational pull across your body stretches you.",
          },
          {
            question: "To a faraway observer, someone falling into a black hole seems to…",
            options: ["Speed up", "Slow down and fade", "Disappear instantly", "Glow blue"],
            answerIndex: 1,
            explanation: "Gravitational time dilation makes the faller appear to slow and redshift.",
          },
          {
            question: "What do scientists know about the center of a black hole?",
            options: [
              "It's a solid ball of iron",
              "It's a wormhole to another universe",
              "We don't know yet — it needs new physics",
              "It's empty space",
            ],
            answerIndex: 2,
            explanation: "The center is beyond our current theories; it's an open question.",
          },
        ],
      },
    ],
  },
  {
    id: "moon-phases",
    title: "Moon Phases",
    description: "Why the Moon changes shape, why we only see one side, and how it moves the oceans.",
    level: "Beginner",
    icon: "Moon",
    gradient: "linear-gradient(135deg, #E0F2FE 0%, #F1F5F9 100%)",
    badge: { id: "badge-lunar-cycle", name: "Lunar Cycle", description: "Completed Moon Phases" },
    lessons: [
      {
        id: "phases",
        title: "Why the Moon changes shape",
        minutes: 3,
        summary: "Half the Moon is always lit — we just see different amounts.",
        body: [
          "The Moon doesn't make its own light; it reflects sunlight. At any moment, **half of the Moon is lit** by the Sun.",
          "As the Moon orbits Earth over about **29.5 days**, we see different portions of that lit half. When the Moon is between Earth and the Sun, the lit side faces away: that's a **new moon**. When Earth is between them, we see the whole lit face: a **full moon**.",
          "Phases are **not** caused by Earth's shadow. Earth's shadow only falls on the Moon during a lunar eclipse.",
        ],
        diagram: "moon-phases",
        diagramCaption: "Drag the Moon around Earth and watch the phase you'd see from home.",
        quiz: [
          {
            question: "What causes Moon phases?",
            options: [
              "Earth's shadow",
              "Clouds",
              "Seeing different portions of the Moon's sunlit half",
              "The Moon changing its brightness",
            ],
            answerIndex: 2,
            explanation: "Half the Moon is always lit; our viewing angle changes as it orbits.",
          },
          {
            question: "How long is the full cycle of phases?",
            options: ["7 days", "About 29.5 days", "365 days", "24 hours"],
            answerIndex: 1,
            explanation: "The synodic month — new moon to new moon — is about 29.5 days.",
          },
          {
            question: "During a full moon, where is the Moon?",
            options: ["Between Earth and the Sun", "On the opposite side of Earth from the Sun", "Behind the Sun", "Next to Venus"],
            answerIndex: 1,
            explanation: "At full moon, Earth sits between the Sun and the Moon, so we see the whole lit face.",
          },
        ],
      },
      {
        id: "one-face",
        title: "Why we only see one side",
        minutes: 3,
        summary: "Tidal locking explained.",
        body: [
          "The Moon spins once on its axis in exactly the time it takes to orbit Earth — about **27.3 days**. So the same face always points toward us. This is called **tidal locking**.",
          "Long ago the Moon spun faster, but Earth's gravity raised bulges on it and gradually slowed its spin until it matched its orbit.",
          "The 'far side' is not dark — it gets just as much sunlight as the near side. It's only hidden from Earth. China's **Chang'e 4** made the first landing there in 2019.",
        ],
        diagram: "moon-phases",
        diagramCaption: "Turn on 'show the Moon's spin' to see tidal locking in action.",
        quiz: [
          {
            question: "Why do we always see the same side of the Moon?",
            options: [
              "The Moon doesn't spin",
              "It spins once per orbit (tidal locking)",
              "The far side is invisible",
              "Earth's atmosphere hides it",
            ],
            answerIndex: 1,
            explanation: "The Moon rotates exactly once per orbit, keeping one face toward Earth.",
          },
          {
            question: "Is the far side of the Moon always dark?",
            options: ["Yes, always", "No — it gets sunlight too, we just can't see it", "Only in winter", "Only during eclipses"],
            answerIndex: 1,
            explanation: "'Dark side' is a myth; it's just the far side.",
          },
          {
            question: "Which mission first landed on the Moon's far side?",
            options: ["Apollo 11", "Chang'e 4", "Artemis I", "Luna 2"],
            answerIndex: 1,
            explanation: "China's Chang'e 4 landed on the far side in January 2019.",
          },
        ],
      },
      {
        id: "tides",
        title: "The Moon and the tides",
        minutes: 3,
        summary: "Two bulges, two high tides a day.",
        body: [
          "The Moon's gravity pulls a little harder on the side of Earth facing it than on Earth's center, and harder on the center than on the far side. That difference stretches the oceans into **two bulges**.",
          "As Earth spins through both bulges each day, most coasts get **two high tides and two low tides**, roughly every 12 hours 25 minutes.",
          "When the Sun and Moon line up (new and full moon), their pulls add up for extra-high **spring tides**. At quarter moons they partly cancel, giving gentler **neap tides**.",
        ],
        diagram: "tides",
        diagramCaption: "Move the Moon and Sun to see spring and neap tides.",
        quiz: [
          {
            question: "Why are there two tidal bulges?",
            options: [
              "Two moons",
              "The Moon's pull differs across Earth, stretching it",
              "Wind pushes water",
              "Earth's magnetic field",
            ],
            answerIndex: 1,
            explanation: "The difference in pull — the tidal force — stretches Earth's oceans along the Earth–Moon line.",
          },
          {
            question: "Spring tides happen when…",
            options: ["It's springtime", "The Sun and Moon line up", "The Moon is at quarter phase", "Earth is farthest from the Sun"],
            answerIndex: 1,
            explanation: "At new and full moon, solar and lunar tides add together.",
          },
          {
            question: "Most coastlines get how many high tides per day?",
            options: ["One", "Two", "Four", "None"],
            answerIndex: 1,
            explanation: "Earth rotates through both bulges each day — two high tides.",
          },
        ],
      },
    ],
  },
];

export function getPath(id: string) {
  return LEARNING_PATHS.find((p) => p.id === id);
}

export function getLesson(pathId: string, lessonId: string) {
  const path = getPath(pathId);
  const index = path?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!path || index < 0) return undefined;
  return { path, lesson: path.lessons[index], index };
}

export const TOTAL_LESSONS = LEARNING_PATHS.reduce((n, p) => n + p.lessons.length, 0);
