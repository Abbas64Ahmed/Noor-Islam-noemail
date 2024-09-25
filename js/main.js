let startBtn = document.querySelector(".start-btn")
let theInput = document.querySelector(".name-input")
let theInputFiled = document.querySelector(".name-input .the-name-of-player");
let thePlayerName = document.querySelector(".header .name span");
let questionsCount = document.querySelector(".header .count span");
let theQuestion = document.querySelector(".quiz-box .the-question");
let theAnswers = document.querySelector(".quiz-box .the-answers");
let theBtn = document.querySelector(".quiz-box .submit-btn");
let theProgDots = document.querySelector(".footer .the-prog-dots");
let theTimer = document.querySelector(".footer .timer span");
let historyList = document.querySelector(".offcanvas-body .players")

let theRightAnswers = 0;
let theWrongAnswers = 0;
let theCurrentQuestion = 0;
let numberOfQuestion = 10;

questionsCount.innerHTML = numberOfQuestion;
makeHistory()

fetch("questions_islam.json") // URL of the API
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json(); // Parse the JSON response
  })
  .then((data) => {

    // start the game & send e-mail
    document.getElementById("my-form").addEventListener("submit",function(event) {
      event.preventDefault();
      sentEmail()
      if (theInputFiled.value !== "") {
        thePlayerName.innerHTML = theInputFiled.value
        theInput.remove()
        makeTimer()
      showQuestion();

      changeTheStatus()
      } else {
        // if the input filed empty make it's color red
        theInputFiled.classList.add("req")
      }
    });

    // select random 10 questions
    // method form article
    let emptyArr =  [...Array(data.questions.length).keys()]; // make arr of ""
    let randomArrForQuestion = emptyArr.sort(() => Math.random() - 0.5)  // make the values random
    randomArrForQuestion.length = numberOfQuestion; // select only the first 10 number


    // my method 
    // let emptyArr =  new Array(data.questions.length).fill(""); // make arr of ""
    // let randomArrForQuestion = emptyArr.map((e) => Math.floor(Math.random() * data.questions.length) ); // make the values random
    // randomArrForQuestion.length = numberOfQuestion; // select only the first 10 number
    // console.log(randomArrForQuestion)


    // make questions dots
    for (i = 0; i < randomArrForQuestion.length; i++) {
      let span = document.createElement("span");
      theProgDots.appendChild(span);
    }
    let theDotsList = document.querySelectorAll(".the-prog-dots span")


    // add clicking functionality to Answers
    addEventListener("click", (a) => {
      if (a.target.classList.contains("answer")) {
        let theAnswersList = document.querySelectorAll(".the-answers .answer");
        theAnswersList.forEach((e) => {
            e.classList.remove("empty-alert");
        });
        theAnswersList.forEach((e) => e.classList.remove("selected"));
        a.target.classList.add("selected");
      }
    });

    // clicking submit btn
    theBtn.addEventListener("click", function () {
      let theSelectedAnswer = document.querySelector(".the-answers .answer.selected .AnswerDiv");
      let theCorrectAnswerIndex = data.questions[randomArrForQuestion[theCurrentQuestion]].correct
      let theAnswer = data.questions[randomArrForQuestion[theCurrentQuestion]].answers[theCorrectAnswerIndex]
      if (theSelectedAnswer) {
        if (theAnswer === theSelectedAnswer.innerHTML) {
          theCurrentQuestion++
          theRightAnswers++
          theSelectedAnswer.classList.add("green")
        } else {
          theCurrentQuestion++
          theWrongAnswers++
          theSelectedAnswer.classList.add("red")
        }
        setTimeout(() => {
          showQuestion()
          changeTheStatus()
        }, 1000);
      } else {
        // alert using bootstrap
        let theAnswersList = document.querySelectorAll(".the-answers .answer");
        theAnswersList.forEach((e) => {
            e.classList.add("empty-alert");
        });
      }
    });



    
    // functions area
    function showQuestion() {
      if (theCurrentQuestion < numberOfQuestion) {
        let question = data.questions[randomArrForQuestion[theCurrentQuestion]].question;
        theQuestion.innerHTML = ""
        theQuestion.appendChild(document.createTextNode(question));

        theAnswers.innerHTML = ""
        let numberOFAnswers = data.questions[theCurrentQuestion].answers.length;
        

        // make arr of random values to used it make answer random  
        let randomArrForAnswers = Array(numberOFAnswers).fill("")
        randomArrForAnswers = randomArrForAnswers.map((e , i) => e = i )
        for (let i = randomArrForAnswers.length - 1; i >= 0; i--) {
          let theBox = randomArrForAnswers[i]
          let randomValue = Math.floor(Math.random() * i)
          randomArrForAnswers[i] = randomArrForAnswers[randomValue]
          randomArrForAnswers[randomValue] = theBox
        }

        // and the answers to the dom randomly
        for (let i = 0; i < numberOFAnswers; i++) {
          let answer = data.questions[randomArrForQuestion[theCurrentQuestion]].answers[randomArrForAnswers[i]];
          let div = document.createElement("div");
          div.classList.add("answer");
          div.classList.add(`${i}`);
          let span = document.createElement("span");
          div.appendChild(span);
          let AnswerDiv = document.createElement("div")
          AnswerDiv.classList.add("AnswerDiv")
          AnswerDiv.appendChild(document.createTextNode(answer))
          div.appendChild(AnswerDiv);
          theAnswers.appendChild(div);
        }
      } else {
        endGame()
      }
    }
    function changeTheStatus() {
      // change number inside counter
      if (theCurrentQuestion > 0) {
        questionsCount.innerHTML = questionsCount.innerHTML - 1
      }

      if (theCurrentQuestion < numberOfQuestion) {
        // change number of blue bots
        for (let i = 0; i <= theCurrentQuestion; i++) {
          theDotsList[i].classList.add("done")
        }
      }

      // reset the timer in the footer
      theTimer.innerHTML = 20
    }

    function endGame() {
      theBtn.classList.add("disable")
      questionsCount.innerHTML = 0;
      // stop timer
      theTimer.remove()

      // add to locale storage 
      let playerName = thePlayerName.innerHTML
      console.log(theRightAnswers)
      let playersData = {
        players: [{name: `${playerName}`, score: `${theRightAnswers}`}]
      }
      if (window.localStorage.getItem("players")) {
        let buffer = JSON.parse(localStorage.getItem("players"))
        if (buffer) {
          buffer.players.push({name: playerName, score: `${theRightAnswers}`}) 
          window.localStorage.setItem("players", JSON.stringify(buffer))
        }
      } else {
        window.localStorage.setItem("players", JSON.stringify(playersData))
      }

      // show the result popup using bootstrap module 
      let result = `your result is ${theRightAnswers}/${numberOfQuestion}!`;
      document.getElementById("gameResult").textContent = result;
      let resultModal = new bootstrap.Modal(document.getElementById('resultModal'));
      resultModal.show();

      makeHistory()
    }
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error);
  });

// append the players data to side bar
function makeHistory() {
  let playerData = JSON.parse(localStorage.getItem("players"))
  if (playerData) {
    let numberOfPlayer = playerData.players.length;
    for (let i = 0; i < numberOfPlayer; i++) {
      let div = document.createElement("div")
      div.classList.add("player")
      let nameSpan = document.createElement("span")
      nameSpan.appendChild(document.createTextNode(`${playerData.players[i].name}`))
      div.appendChild(nameSpan)
      div.appendChild(document.createTextNode(":"))
      let nameScore = document.createElement("span")
      nameScore.appendChild(document.createTextNode(`${playerData.players[i].score}`))
      div.appendChild(nameScore)
      historyList.appendChild(div)
    }
  }
}

// make timer 
function makeTimer() {
    let gameTimer = setInterval(() => {
    let red = document.querySelectorAll(".the-answers .answer")
      red.forEach((e)=> e.classList.remove("red"))
      theTimer.innerHTML = theTimer.innerHTML - 1;
      // document.querySelectorAll(".the-answers .answer").forEach((e)=> e.classList.remove("red"))
      // console.log(theTimer.innerHTML)
      if (theTimer.innerHTML < 10 ) {
        theTimer.parentElement.classList.add("red")
      }
      if (theTimer.innerHTML == 0) {
        theCurrentQuestion++
        theWrongAnswers++
        red.forEach((e)=> e.classList.add("red"))

        setTimeout(() => {
          theTimer.parentElement.classList.add("red")
          showQuestion()
          changeTheStatus()
        }, 1000);

        if (theCurrentQuestion === 10) {
          // when the test end stop to timer 
          clearInterval(gameTimer);
        }
      }
    }, 1000);
  }

// sent email function using Emailjs serves
function sentEmail() {
  let players = {
    name : document.querySelector(".the-name-of-player").value
  }
  emailjs.send("service_3ne7ner", "template_b1cibkm", players)
  console.log("maasses")
}

// replay btn in the end of the game
document.getElementById("replay-btn").addEventListener("click", ()=> {
  location.reload();
})