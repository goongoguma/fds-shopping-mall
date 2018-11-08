import "@babel/polyfill"; // 이 라인을 지우지 말아주세요!
// 페이지 그리는 함수 작성 순서
// 1. 템플릿 복사
// 2. 요소 선택
// 3. 필요한 데이터 불러오기
// 4. 내용 채우기
// 5. 이벤트 리스너 등록하기
// 6. 템플릿을 문서에 삽입

import axios from "axios";

const api = axios.create({
  baseURL: process.env.API_URL
});

api.interceptors.request.use(function(config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = "Bearer " + token;
  }
  return config;
});

const templates = {
  loginForm: document.querySelector("#login-form").content,
  productsUl: document.querySelector("#products-ul").content,
  productsLi: document.querySelector("#products-li").content,
  productsInfo: document.querySelector("#products-info").content
};

const rootEl = document.querySelector(".root");

/*************************** 로그인 ***************************/
async function drawLoginForm() {
  // 템플릿 복사
  const frag = document.importNode(templates.loginForm, true);

  // 요소 선택
  const formEl = frag.querySelector(".login-form");

  formEl.addEventListener("submit", async e => {
    e.preventDefault();
    const username = e.target.elements.username.value;
    const password = e.target.elements.password.value;

    const res = await api.post("/users/login", {
      username,
      password
    });
    console.log(res);
    if (res.status === 200) {
      alert("환영합니다.");
      rootEl.textContent = "";
    }
    localStorage.setItem("token", res.data.token);
  });
  // 템플릿 문서를 삽입

  rootEl.appendChild(frag);
}
drawLoginForm();

/*************************** 메인화면 상품 ***************************/
async function drawProductsList() {
  const res = await api.get("/products");
  const list = res.data;

  // 페이지 그리는 함수 작성 순서
  const frag = document.importNode(templates.productsUl, true);
  const productsListEl = frag.querySelector(".products-list");
  const homeEl = frag.querySelector(".home-button");
  const laptopEl = frag.querySelector(".laptop");
  const tabletEl = frag.querySelector(".tablet");
  const consoleEl = frag.querySelector(".console-game");
  const phoneEl = frag.querySelector(".phone");
  const categoryList = frag.querySelector('.category-list')
  homeEl.addEventListener('click', e => {
    rootEl.textContent='';
    drawProductsList();
  })
  /******** Laptop 페이지 ********/
  // 페이지 그리는 함수 작성 순서
  // 1. 템플릿 복사

  async function drawCategory(category) {
    const res = await api.get(`/products?category=${category}`);
    // res.data[0].mainImgUrl
    productsListEl.textContent = "";
    for (let i = 0; i < res.data.length; i++) {
      const frag = document.importNode(templates.productsLi, true);
      const productsLiEl = frag.querySelector(".productsLiEl");
      const imageEl = frag.querySelector(".image");
      imageEl.src = res.data[i].mainImgUrl;
      // console.log(res.data[i].id)
      productsLiEl.appendChild(imageEl);
      productsListEl.appendChild(frag);

      productsLiEl.addEventListener("click", e => {
        information(res.data[i].id);
        productsListEl.textContent = "";
        categoryList.textContent = '';
      });
    }
  }

  laptopEl.addEventListener("click", e => {
    drawCategory("Laptop");
  });
  tabletEl.addEventListener("click", e => {
    drawCategory("Tablet");
  });
  consoleEl.addEventListener("click", e => {
    drawCategory("ConsoleGame");
  });
  phoneEl.addEventListener("click", e => {
    drawCategory("Phone");
  });

  rootEl.appendChild(frag);
}

drawProductsList();

/*************************** 세부화면 상품 ***************************/
async function information(liId) {
  const res = await api.get("/products");
  const list = res.data;

  // 페이지 그리는 함수 작성 순서
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productsInfo, true);
  // 2. 요소 선택
  const infoEl = frag.querySelector('.infoEl');
  const homeEl = frag.querySelector(".home-button");
  homeEl.addEventListener('click', e => {
    rootEl.textContent='';
    drawProductsList();
  })


  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  if(liId) {
    const res = await api.get(`/products/${liId}/`);
    const detailImgUrls = res.data.detailImgUrls
    infoEl.setAttribute('src', detailImgUrls[0]);
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.appendChild(frag);
}
