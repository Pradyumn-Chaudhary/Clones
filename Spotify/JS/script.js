const currSong = new Audio();
currSong.src = "";
let prevSongID = "-1";
let numberOfSong = 1;
let songs = [];
let loop = false;
let suffle = false;
let volumeLevel = 1;
let currFolder = "";
let t = -1;
let stack = [];
let isLogged = false;

document.body.addEventListener("contextmenu", (e) => {
  e.preventDefault();
}
);

async function fetchArtist() {
  let a = await fetch("http://192.168.53.242:3000/Songs/Artist");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.includes("/Artist")) {
      let folder = element.href.split("/Artist")[1].replaceAll("/", "");
      let j = await fetch(`${element}/info.json`);
      let res = await j.json();
      document.querySelector("#artist").innerHTML += ` <div class="card flex column justify-center">
      <img src="${element.href}cover.png" alt="${res.artist_name}" />
      <span class="artist-name underline">${res.artist_name}</span>
          <span class="b3 prop">Artist</span>
          <div data-folder="Artist/${folder}" class="play flex justify-center item-center">
          <img src="Images/Play-button.svg" alt="" />
          </div>
        </div>`
      }
  }
  
  document.querySelectorAll(".play").forEach(playButton => {
    playButton.addEventListener("click", (e) => {
      logInFirst();document.querySelector("#logIn-alert").style.zIndex = 2;
    });
  });
}

async function fetchAlbum() {
  let a = await fetch("http://192.168.53.242:3000/Songs/Album");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.includes("/Album")) {
      let folder = element.href.split("/Album")[1].replaceAll("/", "");
      let j = await fetch(`${element}/info.json`);
      let res = await j.json();
      
      document.querySelector("#album").innerHTML += `<div class="card1 br-10 flex column justify-center">
          <img src="${element.href}cover.png" alt="${res.album_name}" />
          <span class="artist-name underline">${res.album_name}</span>
          <span class="b3 prop">${res.artist_name}</span>
          <div data-folder="Album/${folder}" class="play flex justify-center item-center">
            <img src="Images/Play-button.svg" alt="" />
          </div>
        </div>`
      }
  } 

  document.querySelectorAll(".play").forEach(playButton => {
    playButton.addEventListener("click", (e) => {
      logInFirst();document.querySelector("#logIn-alert").style.zIndex = 2;
    });
  });
}

fetchAlbum();
fetchArtist();

async function getSong(folder) {
  prevSongID = "-1";
  songs.splice(0, songs.length);
  let a = await fetch(`http://192.168.53.242:3000/Songs/${folder}`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  for (let index = 0; index < as.length; index++) {
    let song = as[index];
    if (song.href.endsWith("mp3")) {
      songs.push(song.href);
    }
  }
  return songs;
}

function playMusic(track, index) {
  let ID = `play${index}`;
  currSong.volume = volumeLevel;
  if (currSong.src === track && !currSong.paused) {
    currSong.pause();
    document.getElementById(ID).innerHTML = `<img src="Images/play0.svg" alt="">`;
    document.getElementById("play-btn").innerHTML = `<img src="Images/Play.svg" alt="Play" />`
    return;
  }
  if (prevSongID !== "-1") {
    document.getElementById(prevSongID).innerHTML = `<img src="Images/play0.svg" alt="">`;
    document.getElementById("play-btn").innerHTML = `<img src="Images/Play.svg" alt="Play" />`
  }
  if (currSong.src !== track) {
    currSong.src = track;
    t++;
    stack[t] = index;
  }
  if (t === -1 && currSong.src == songs[0]) {
    t++;
    stack[t] = index;
  }
  currSong.play();
  let songInfo = track.split(`${currFolder}/`)[1].replaceAll("%20", " ").split("-");
  let songName = songInfo[0];
  let artistName = songInfo[1].replace(".mp3", "");
  document.getElementsByClassName(
    "song"
  )[0].innerHTML = `${songName}, ${artistName}`;
  document.getElementById(ID).innerHTML = `<img src="Images/pause0.svg" alt="">`;
  setTimeout(() => {
    document.getElementById("play-btn").innerHTML = `<img src="Images/Pause.svg" alt="Pause" />`
  }, 200);
  prevSongID = ID;

  currSong.addEventListener("timeupdate", () => {
    let progress = (currSong.currentTime / currSong.duration) * 100;
    document.getElementById("song-mover").style.left = `${progress}%`;
    document.getElementById("song-bar").style.width = `calc(9px + ${progress}%)`;
    document.getElementById("curr-tm").innerHTML = formatTime(currSong.currentTime);
    document.getElementById("song-dur").innerHTML = formatTime(currSong.duration);
    if (progress == 100) {
      if (loop) {
      playMusic(track, index);
      } else if (suffle) {
        let i = Math.floor(Math.random() * numberOfSong);
        playMusic(songs[i], i);
      }
      else {
      let i = (index + 1) % numberOfSong;
      playMusic(songs[i], i);
      }
    }
  });
}

function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = Math.floor(seconds % 60);
  return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

async function main(folder) {
  document.getElementsByClassName("scroll")[0].innerHTML = "";
  await getSong(folder);
  currSong.src = songs[0];
  numberOfSong = songs.length;
  let songCardHTML = "";
  for (let index = 0; index < songs.length; index++) {
    const element = songs[index];
    let temp = element.split(`${folder}/`);
    let song = temp[1].replaceAll("%20", " ");
    let part = song.split("-");
    songCardHTML += `<div class="song-card flex justify-between item-center">
            <div class="flex item-center">
            <img src="Images/music.svg" alt="music">
            <div class="flex column gap-7">
              <span>${part[0]}</span>
              <span>${part[1].replace(".mp3", "")}</span>
            </div>
            </div>
            <div id="play${index}">
            <img src="Images/play0.svg" alt="">
            </div>
          </div>`;
  }
  document.getElementsByClassName("scroll")[0].innerHTML += songCardHTML;
  songs.forEach((element, index) => {
    let songCard = document
      .querySelector(".scroll")
      .getElementsByClassName("song-card")[index];
    songCard.addEventListener("click", () => playMusic(element, index));
  });
}

const signed = () => {
  isLogged = true;
  document.querySelector("#logIn-alert").style.zIndex = -1;
  document.getElementById("plus").style.width = "0px"
  document.getElementsByClassName("scroll")[0].innerHTML = "";
  document.getElementsByClassName("log-btn")[0].innerHTML = "Log out";
  document.getElementsByClassName("sign-btn")[0].innerHTML = "";
  document.getElementsByClassName(
    "right"
  )[0].innerHTML += `<div class="play-bar flex justify-evenly item-center">
          <div class="song-info flex column item-center justify-between">
            <div class="song">
              Song Name,Artist Name
            </div>
            <div id="seekBar" class="flex item-center justify-center gap-7">
              <span id="curr-tm">00:00</span>
              <div class="seek-bar">
                <div id="song-bar"></div>
                <div id="song-mover" class="mover"></div>
            </div>
            <span id="song-dur">00:00</span>
            </div>
          </div>
          <div class="play-controls flex justify-center item-center">
            <svg id="suffle-btn" xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" fill="#b3b3b3" class="Svg-sc-ytk21e-0 dYnaPI"><path d="M13.151.922a.75.75 0 1 0-1.06 1.06L13.109 3H11.16a3.75 3.75 0 0 0-2.873 1.34l-6.173 7.356A2.25 2.25 0 0 1 .39 12.5H0V14h.391a3.75 3.75 0 0 0 2.873-1.34l6.173-7.356a2.25 2.25 0 0 1 1.724-.804h1.947l-1.017 1.018a.75.75 0 0 0 1.06 1.06L15.98 3.75 13.15.922zM.391 3.5H0V2h.391c1.109 0 2.16.49 2.873 1.34L4.89 5.277l-.979 1.167-1.796-2.14A2.25 2.25 0 0 0 .39 3.5z"></path><path d="m7.5 10.723.98-1.167.957 1.14a2.25 2.25 0 0 0 1.724.804h1.947l-1.017-1.018a.75.75 0 1 1 1.06-1.06l2.829 2.828-2.829 2.828a.75.75 0 1 1-1.06-1.06L13.109 13H11.16a3.75 3.75 0 0 1-2.873-1.34l-.787-.938z"></path></svg>
            <img id="prev-btn" src="Images/previous-btn.svg" alt="prev" />
            <div id="play-btn" class="flex justify-center item-center">
              <img src="Images/Play.svg" alt="Play" />
            </div>
            <img id="next-btn" src="Images/next-btn.svg" alt="next" />
            <svg id="loop-btn" xmlns="http://www.w3.org/2000/svg" data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 16 16" fill="#b3b3b3" class="Svg-sc-ytk21e-0 dYnaPI"><path d="M0 4.75A3.75 3.75 0 0 1 3.75 1h8.5A3.75 3.75 0 0 1 16 4.75v5a3.75 3.75 0 0 1-3.75 3.75H9.81l1.018 1.018a.75.75 0 1 1-1.06 1.06L6.939 12.75l2.829-2.828a.75.75 0 1 1 1.06 1.06L9.811 12h2.439a2.25 2.25 0 0 0 2.25-2.25v-5a2.25 2.25 0 0 0-2.25-2.25h-8.5A2.25 2.25 0 0 0 1.5 4.75v5A2.25 2.25 0 0 0 3.75 12H5v1.5H3.75A3.75 3.75 0 0 1 0 9.75v-5z"></path></svg>
          </div>
          <div class="vol flex item-center gap-7">
            <img src="Images/volume.svg" alt="vol" />
            <div id="vol-seek-bar" class="seek-bar">
           <div>
            <div id="vol-bar"></div>
            <div id="vol-mover" class="mover"></div>
          </div>
            </div>
          </div>
        </div>`;

  showAlbum();
  showArtist();

  document.getElementById("play-btn").addEventListener("click", () => {
    if (prevSongID === "-1") {
      playMusic(currSong.src, 0);
    } else {
      playMusic(currSong.src, parseInt(prevSongID.replace(/^\D+/, ''), 10));
    }
  });

  document.getElementById("loop-btn").addEventListener("click", () => {
    if (suffle) {
      suffle = !suffle;
      document.getElementById("suffle-btn").setAttribute("fill", suffle ? "#41c447" : "#b3b3b3");
    }
    loop = !loop;
    document.getElementById("loop-btn").setAttribute("fill", loop ? "#41c447" : "#b3b3b3");
  }
  );
  document.getElementById("suffle-btn").addEventListener("click", () => {
    if (loop) {
    loop = !loop;
    document.getElementById("loop-btn").setAttribute("fill", loop ? "#41c447" : "#b3b3b3");
    }
    suffle = !suffle;
    document.getElementById("suffle-btn").setAttribute("fill", suffle ? "#41c447" : "#b3b3b3");
  }
  );

  let prevButton = document.getElementById("prev-btn");
  prevButton.addEventListener("click", () => {
    if (t === -1 || t === 0) {
      currSong.currentTime = "0";
      return;
    }
    t--;
    playMusic(songs[stack[t]], stack[t]);
    t--;
  }
  );

  let nextButton = document.getElementById("next-btn");
  nextButton.addEventListener("click", () => {
    if (prevSongID == -1) {
      return;
    } else {
      if (loop) {
        let i = parseInt(prevSongID.replace(/^\D+/, ''), 10)
        currSong.currentTime = "0";
        playMusic(songs[i], i);
        playMusic(songs[i], i);
      } else if (suffle) {
        let i = Math.floor(Math.random() * numberOfSong);
        playMusic(songs[i], i);
      } else {
        let i = parseInt(prevSongID.replace(/^\D+/, ''), 10)
        i = (i + 1) % numberOfSong;
        playMusic(songs[i], i);
      }
    }
  }
  );

  let songBar = document.getElementsByClassName("seek-bar")[0];
  function updateSong(e) {
    let progress = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector("#song-mover").style.left = `${progress}%`;
    document.querySelector("#song-bar").style.width = `calc(9px + ${progress}%)`
    currSong.currentTime = (currSong.duration * progress) / 100;
  };
  songBar.addEventListener("click", (e) => {
    updateSong(e);
  }
  );
  

  let volBar = document.getElementsByClassName("seek-bar")[1];
  function updateVolume(e) {
    let progress = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector("#vol-mover").style.left = `${progress}%`
    document.querySelector("#vol-bar").style.width = `calc(9px + ${progress}%)`
    volumeLevel = progress / 100;
    currSong.volume = volumeLevel;
  };
  volBar.addEventListener("click", (e) => {
    updateVolume(e);
  }
  );
  document.querySelectorAll(".play").forEach(playButton => {
    playButton.addEventListener("click", (e) => {
      if (isLogged) {
        currFolder = e.currentTarget.getAttribute('data-folder'); 
        document.getElementById("play-btn").innerHTML = `<img src="Images/Play.svg" alt="Play" />`
        main(currFolder);
      } else {
        document.querySelector("#logIn-alert").style.zIndex = 2;
      }
    });
  });
};
const logout = () => {
  isLogged = false;
  currSong.pause();
  currSong.src = "";
  document.getElementById("plus").style.width = "24px";
  document.getElementsByClassName(
    "scroll"
  )[0].innerHTML = ` <div class="create-playlist bg flex column">
            <span class="bg">Create your first playlist</span>
            <span class="bg">It's easy, we will help you</span>
            <button>Create playlist</button>
          </div>
          <div class="browse-podcast bg flex column">
            <span class="bg">Let's find some podcasts to follow</span>
            <span class="bg">We'll keep you updated on new episodes</span>
            <button>Browse podcasts</button>
          </div>
`;
  document.getElementsByClassName("log-btn")[0].innerHTML = "Log in";
  document.getElementsByClassName("sign-btn")[0].innerHTML = "Sign in";
  document.querySelector(".play-bar").remove();
};

document.getElementsByClassName("log-btn")[0].addEventListener("click", () => {
  if (document.getElementsByClassName("log-btn")[0].innerHTML === "Log in") {
    signed(); 
  } else {
    logout(); 
    logInFirst();
  }
});
document
  .getElementsByClassName("sign-btn")[0]
  .addEventListener("click", signed);

showAlbum();
showArtist();
  
function showArtist(){
  document.getElementById("show-allArtist").addEventListener("click", () => {
    let temp = document.getElementById("show-allArtist");
    let container = document.getElementById("artist");
    if (temp.innerHTML === "Show all") {
      temp.innerHTML = "Show less";
      container.style.flexWrap = "wrap";
    } else {
      temp.innerHTML = "Show all";
      container.style.flexWrap = "nowrap";
    }
  });
};

function showAlbum(){
  document.getElementById("show-allAlbum").addEventListener("click", () => {
    let temp = document.getElementById("show-allAlbum");
    let container = document.getElementById("album");
    if (temp.innerHTML === "Show all") {
      temp.innerHTML = "Show less";
      container.style.flexWrap = "wrap";
    } else {
      temp.innerHTML = "Show all";
      container.style.flexWrap = "nowrap";
    }
  })
};

logInFirst();

function logInFirst() {
  document.querySelector(".create-playlist").childNodes[5].addEventListener("click", () => {
    document.querySelector("#logIn-alert").style.zIndex = 2;
  }
  );
  document.querySelector(".browse-podcast").childNodes[5].addEventListener("click", () => {
    document.querySelector("#logIn-alert").style.zIndex = 2;
  }
  );
}

document.querySelector("#logIn-alert").childNodes[1].addEventListener("click", (e) => {
  document.querySelector("#logIn-alert").style.zIndex = -1;
}
);

document.getElementById("menu").addEventListener("click", () => {
  let e = document.querySelector("#left");
  let z = getComputedStyle(e).zIndex;
  if (z == 0) {
    e.style.zIndex = 1;
    document.querySelector(".right").style.zIndex = "0";
  } else {
    e.style.zIndex = 0;
    document.querySelector(".right").style.zIndex = "1";
  }
}
);







































// const seekBar = document.querySelector(".seek-bar");
  // const mover = document.querySelector(".mover");

  

  // // Handle dragging of the mover
  // let isDragging = false;

  // mover.addEventListener("mousedown", () => {
  //   isDragging = true;
  //   currSong.pause(); // Pause the song while dragging
  // });

  // document.addEventListener("mousemove", (e) => {
  //   if (isDragging) {
  //     const rect = seekBar.getBoundingClientRect();
  //     const offsetX = e.clientX - rect.left; // Mouse position relative to seek bar
  //     const progress = Math.max(0, Math.min(offsetX / rect.width, 1)); // Clamp between 0 and 1
  //     mover.style.left = `${progress * 100}%`;
  //     seekBar.style.setProperty("--progress-width", `${progress * 100}%`); // Update white background
  //   }
  // });

  // document.addEventListener("mouseup", () => {
  //   if (isDragging) {
  //     isDragging = false;
  //     const rect = seekBar.getBoundingClientRect();
  //     const offsetX = parseFloat(mover.style.left) / 100;
  //     const newTime = offsetX * currSong.duration; // Calculate new time
  //     currSong.currentTime = newTime; // Set new time
  //     currSong.play(); // Resume playback
  //   }
  // });

  // // Handle clicking on the seek bar
  // seekBar.addEventListener("click", (e) => {
    // const rect = seekBar.getBoundingClientRect();
    // const offsetX = e.clientX - rect.left; // Mouse position relative to seek bar
    // const progress = Math.max(0, Math.min(offsetX / rect.width, 1)); // Clamp between 0 and 1
    // mover.style.left = `${progress * 100}%`;
    // seekBar.style.setProperty("--progress-width", `${progress * 100}%`); // Update white background
    // currSong.currentTime = progress * currSong.duration; // Update song time
    // currSong.play(); // Resume playback
  // });

document.querySelector(".sourceCode").addEventListener("click", () => {
  //Open GitHub repository for Source Code
  window.open("https://github.com/Pradyumn-Chaudhary/Clones/tree/main/Spotify", "_blank");
}
);