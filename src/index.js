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
  productsInfo: document.querySelector('#products-info').content

};

const rootEl = document.querySelector(".root");

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

async function drawProductsList() {
  const res = await api.get("/products");
  const list = res.data;


  // 페이지 그리는 함수 작성 순서

  const frag = document.importNode(templates.productsUl, true);
  const productsListEl = frag.querySelector(".products-list");

  list.forEach(li => {
    // 1. 템플릿 복사
    const frag = document.importNode(templates.productsLi, true);
    const productsLiEl = frag.querySelector('.productsLiEl');
    const nameEl = frag.querySelector('.name');
    // 2. 요소 선택
    const imageEl = frag.querySelector(".image");
    // 3. 필요한 데이터 불러오기
    // 4. 내용 채우기
    // 이미지 태그의 src 속성을 넣어준다.
    imageEl.setAttribute("src", li.mainImgUrl);
    // 5. 이벤트 리스너 등록하기
    // 6. 템플릿을 문서에 삽입
    productsListEl.appendChild(frag);
    nameEl.textContent =
    productsLiEl.addEventListener('click', e => {
      information(li.id)
      rootEl.textContent = "";
      console.log(li.id)

    })
  });

  rootEl.appendChild(frag);
}
drawProductsList();

async function information(liId) {
  const res = await api.get("/products");
  const list = res.data;

  // 페이지 그리는 함수 작성 순서
  // 1. 템플릿 복사
  const frag = document.importNode(templates.productsInfo, true);
  // 2. 요소 선택
  const infoEl = frag.querySelector('.infoEl');

  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  if(liId) {
    const res = await api.get(`/products/${liId}/`);
    const detailImgUrls = res.data.detailImgUrls
    infoEl.setAttribute('src', detailImgUrls[0]);
    console.log(infoEl)
    frag.appendChild(infoEl);
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.appendChild(frag);
}
