export const users = [
  {
    _id: 1,
    name: 'Ruby',
    age: 16,
    student: true,
    weaknesses: undefined,
    threats: null,
    birth: new Date(2007, 11, 10),
    pattern: /Ruby/,
    // greeting: () => console.log("Hi, I'm Ruby!"), // functions excluded since they are not parsed properly in mongo, can be stored as string
    favouriteFoods: [
      'pizza',
      'hamburger',
      'chips'
    ],
    address: {
      street: 'Pike Lane',
      city: 'Los Angeles'
    },
    // for recursive cases
    extraInfoObject: { // object with string[]
      arr: [
        'string1',
        'string2',
        'string3'
      ]
    },
    extraInfoArray: [ // object[] (different structures)
      {
        name: 'Ruby'
      },
      {
        name: 'Nick'
      },
      {
        name: 'Sakura',
        external: true
      }
    ]
  },
  {
    _id: 2,
    name: 'Nick',
    age: 17,
    student: true,
    weaknesses: ['black gem'], // WILL DIFFER
    threats: ['gray gem', 'purple gem'], // WILL DIFFER
    birth: new Date(2006, 11, 10),
    pattern: /Nick/,
    // greeting: () => console.log(Hello, it's Nick!), // functions excluded since they are not parsed properly in mongo, can be stored as string
    favouriteFoods: [
      'pizza',
      'hamburger',
      'chips',
      'apples'
    ],
    address: {
      street: 'Pike Lane',
      city: 'Los Angeles'
    },
    // for recursive cases
    extraInfoObject: { // WILL DIFFER
      arr: [
        'string1',
        'string2',
        'string3',
        { // different data type
          nonStandardObjectKey: true
        }
      ]
    },
    extraInfoArray: [ // WILL DIFFER
      {
        name: 'Ruby'
      },
      {
        name: 'Nick'
      },
      {
        name: 'Sakura',
        external: true
      },
      {
        name: 'Shirou',
        external: true,
        habilities: ['Strenghtening', 'Projection', 'Rho Aias', 'Unlimited Blade Works'] // different object structure
      }
    ]
  }
]
