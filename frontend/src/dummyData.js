export const dummyPosts = [
  {
    id: 1,
    title: "Awesome Church",
    author: "BricBoi",
    authorAvatar: "/blank-profile-picturesvg.svg",
    image: "/legoBuild1.jpg",
    description: "Look at this really cool church I made!",
    tags: ["#pope","#church"],
    likes: 42,
    isFriend: true,
    comments: [
      { id: 1, username: "BrickFan88", text: "Incredible attention to detail on the roof" },
      { id: 2, username: "HaterMan67", text: "This is so bad bro" }
    ]
  },
  {
    id: 2,
    title: "Stars Wars X-Fighter and Ti Jets",
    author: "StarWarsLarper",
    authorAvatar: "/blank-profile-picturesvg.svg",
    image: "/legoBuild2.jpg",
    description: "Just rewatched the orginal stars wars movies, feeling nostalgic.",
    tags: ["#starwars","#space","#jets"],
    likes: 68,
    isFriend: false,
    comments: [
      { id: 1, username: "nerd101", text: "W larping" }
    ]
  },
  {
    id: 3,
    title: "Simple Lego Rainbow",
    author: "RainbowGirl29",
    authorAvatar: "/blank-profile-picturesvg.svg",
    image: "/legoBuild3.jpg",
    description: "Just wanted to show everyone this cute little rainbow I made the other day.",
    tags: ["#rainbow","#cute","#easy"],
    likes: 55,
    isFriend: true,
    comments: [
      { id: 1, username: "LegoLover", text: "I am going to try and make this myself thx!" }
    ]
  }
];

export const dummyUser = {
  id: 1,
  username: "BricBoi",
  email: "masterbuilder@lego.com",
  avatar: "/blank-profile-picturesvg.svg",
  bio: "Master Builder",
  friendStatus: "self",
  friends: [
    { id: 2, username: "LegoLover", avatar: "/blank-profile-picturesvg.svg"},
    { id: 3, username: "RainbowGirl29", avatar: "/blank-profile-picturesvg.svg"},
    { id: 4, username: "StarWarsLarper", avatar: "/blank-profile-picturesvg.svg"}
  ],
  posts: [
    {
    id: 1,
    title: "Awesome Church",
    image: "/legoBuild1.jpg",
    description: "Look at this really cool church I made!",
    tags: ["#pope","#church"],
    likes: 42
    }
  ]
};
