const toogle_theme = document.querySelector('.theme-toggle');
const btn_theme = document.querySelector('.btn-theme');
const quiz_container = document.getElementById('subject-quiz');
const quest_content = document.getElementById('quest-content');
const select_error = document.getElementById('select-error');
let data_json = {};
let current_num = 0;
let score = 0;
let current_click = false;
let current_quiz = {};
let answered_questions = [];
let correct_answer = '';
let save_header = '';

if (toogle_theme) {
  toogle_theme.addEventListener('click', function() {
    document.body.classList.toggle('dark-theme');
    btn_theme.classList.toggle('dark-position');
  });
  toogle_theme.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); 
      toggleTheme();
    }
  });
}
function toggleTheme() {
  const dark = document.documentElement.classList.toggle('dark');
  btn_theme.setAttribute('aria-pressed', String(dark));
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error('Error: ' + response.statusText);
            }
            return response.json(); 
        })
        .then(data => {
            loadQuiz(data.quizzes)
            data_json = data.quizzes;
        })
        .catch(error => {
            console.error('Помилка під час отримання даних:', error);
        });
});

function loadQuiz(data) {
  Object.keys(data).forEach(key => {
    let quyzz = data[key];
    let subject_div = addIcon(quyzz.title, quyzz.icon);
    subject_div.addEventListener('click', () => {
      handleSubjectClick(key);
    }); 
    quiz_container.appendChild(subject_div);
  });
}
function addIcon(title, iconSrc, bg = false) {
    const subjectDiv = document.createElement('button');
    subjectDiv.type = 'button';
    subjectDiv.classList.add('subject');
    subjectDiv.setAttribute('aria-pressed', 'false');

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('subject-icon');
    const img = document.createElement('img');
    img.src = iconSrc;
    img.alt = `${title} icon`;
    iconSpan.appendChild(img);
    if (bg) {
      iconSpan.classList.add('icon-bg');
      iconSpan.style.backgroundColor = 'transparent';
      iconSpan.style.position = 'relative';
      iconSpan.style.right = '-1.5rem';
      iconSpan.style.display = 'none';
    }
    const titleSpan = document.createElement('span');
    titleSpan.classList.add('subject-title');
    titleSpan.textContent = title;
    subjectDiv.appendChild(iconSpan);
    subjectDiv.appendChild(titleSpan);
  return subjectDiv;
}

function handleSubjectClick(key) {
  document.querySelectorAll('.quiz-header').forEach(el => el.remove());
  const quizz = data_json[key];
  current_quiz = quizz;
  let header_div = addIcon(quizz.title, quizz.icon);
  header_div.classList.add('quiz-header');
  const header_container = document.querySelector('header');
  header_container.prepend(header_div);
  handleItemQuiz(current_num)
}

function handleItemQuiz(num) {
  current_click = false;
  const quiz_item = current_quiz.questions[num];
  answered_questions = quiz_item;
  save_header = quest_content.innerHTML;
  quest_content.innerHTML = '';
  const counterEl = document.createElement('p');
  counterEl.classList.add('pick');
  counterEl.textContent = `Question ${num + 1} of ${current_quiz.questions.length}`;
  quest_content.appendChild(counterEl);
  const questionEl = document.createElement('h2');
  questionEl.classList.add('question');  
  questionEl.textContent = quiz_item.question;
  quest_content.appendChild(questionEl);
  let progressBar = createProgress(num + 1, current_quiz.questions.length);
  quest_content.appendChild(progressBar);
  createAnswers(quiz_item.options)
}

function createProgress(num, total) {
  const progressEl = document.createElement('div');
  progressEl.classList.add('brogress-total');
  let procent = Math.round((num / total) * 100);
  const progressBar = document.createElement('div');
  progressBar.classList.add('brogress-bar');
  progressBar.style.width = `${procent}%`;
  progressEl.appendChild(progressBar);
  return progressEl;
}

function createAnswers(answers) {
  const letters_arr = ['A', 'B', 'C', 'D'];
  let i = 0;
  // alert('this is click  answer');
  quiz_container.innerHTML = '';
  const err_icon = 'assets/images/icon-error.svg';
  const success_icon = 'assets/images/icon-correct.svg';
  let err_div = addIcon('', err_icon, true);
  let success_div = addIcon('', success_icon, true);
  answers.forEach(answer => {
    const subjectDiv = document.createElement('div');
    subjectDiv.classList.add('subject');
    subjectDiv.classList.add('answer-option');
    const letterSpan = document.createElement('span');
    letterSpan.classList.add('subject-icon');
    letterSpan.textContent = letters_arr[i];
    const titleSpan = document.createElement('span');
    titleSpan.classList.add('subject-title');
    titleSpan.textContent = answer;
    subjectDiv.appendChild(letterSpan);
    subjectDiv.appendChild(titleSpan);
    if(answer === answered_questions.answer) {
      correct_answer = answer;
      subjectDiv.appendChild(success_div.cloneNode(true));
    } else {
      subjectDiv.appendChild(err_div.cloneNode(true));
    }
    subjectDiv.style.setProperty('justify-content', 'space-between');
    subjectDiv.addEventListener('click', () => {
      let change = answer === answered_questions.answer ? 'correct' : 'incorrect';
      handleAnswer(answer, subjectDiv, change);
      let submitBtn = document.querySelector('.submit-btn');
      submitBtn.textContent ='Next Question';
    }); 
    quiz_container.appendChild(subjectDiv);
  });
  i++;
  addBtnSubmit(i);
}
function handleAnswer(answer, subjectDiv, change) {  
  if (current_click) return;
  select_error.style.display = 'none';
  subjectDiv.classList.add(change);
  showChange(subjectDiv)
  current_click = true;
  const correct_answer = answered_questions.answer;
  document.querySelectorAll('.answer-option').forEach(el => {
    let el_text = el.querySelector('.subject-title').textContent;
    if (el_text === correct_answer) {
      el.classList.add('correct');
      showChange(el)
    }     
  });
  if (answer === correct_answer) {
    score++;        
  } 
}
function addBtnSubmit(i) {  
  const submitBtn = document.createElement('button');
  submitBtn.classList.add('submit-btn');
  submitBtn.textContent = 'Submit answer';
  submitBtn.addEventListener('click', () => {
    if (!current_click) {
      select_error.style.display = 'block';
      return;
    } else {
      select_error.style.display = 'none';
    }
    current_num++;
    if (current_num < current_quiz.questions.length) {
      handleItemQuiz(current_num);
    } else {
      quest_content.innerHTML = '';
      view_result();     
    } 
  });
  quiz_container.appendChild(submitBtn);
}

function showChange(el) {
  let ans_icon = el.querySelector('.icon-bg');
  ans_icon.style.display = 'block';
  el.style.setProperty('padding', '0.1rem 0.5rem');
}

function view_result() {
  let result_div = document.getElementById('summary');   
  let title = current_quiz.title;
  let iconSrc = current_quiz.icon;
  let head_result = addIcon(title, iconSrc);
  head_result.style.setProperty('justify-content', 'center');
  let h_res = document.getElementById('summary-header');
  h_res.innerHTML = '';
  h_res.appendChild(head_result);
  result_div.style.display = 'block';
  document.querySelector('.coutn-right').textContent = score;
  quiz_container.innerHTML = '';
  quiz_container.appendChild(result_div); 
  const submitBtn = document.createElement('button');
  submitBtn.classList.add('submit-btn');
  submitBtn.textContent = 'Play again';
  submitBtn.addEventListener('click', () => { 
    restart_quizzes();
   });
  quiz_container.appendChild(submitBtn);
  let resume_message = document.createElement('h2');
  resume_message.classList.add('welcom');
  resume_message.innerHTML = `<span>Quiz completed</span> You scored...`;
  quest_content.appendChild(resume_message);
  document.getElementById('total-count').textContent = current_quiz.questions.length;
}
function restart_quizzes() {
  current_num = 0;
  score = 0;
  current_click = false;
  current_quiz = {};
  answered_questions = [];
  correct_answer = '';
  save_header = '';
  quiz_container.innerHTML = save_header;
  loadQuiz(data_json);
  // location.reload();
}
document.querySelectorAll('.subject[role="button"]').forEach(el => {
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Space scroll prevention
        el.click(); // or call the function that triggers the action
      }
    });
  });