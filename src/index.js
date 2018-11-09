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
  productsInfo: document.querySelector("#products-info").content,
  description: document.querySelector("#description").content,
  cartUl: document.querySelector('#ordered-list').content,
  cartLi: document.querySelector("#cart-list").content
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
    if (res.status === 200) {
      alert("환영합니다.");
      rootEl.textContent = "";
      drawProductsList();
    }
    localStorage.setItem("token", res.data.token);
  });
  // 템플릿 문서를 삽입

  rootEl.appendChild(frag);
}

/*************************** 메인 카테고리 ***************************/
async function drawProductsList() {
  const res = await api.get("/products");
  const list = res.data;
  const frag = document.importNode(templates.productsUl, true);
  const productsListEl = frag.querySelector(".products-list");
  const homeEl = frag.querySelector(".home-button");
  const laptopEl = frag.querySelector(".laptop");
  const tabletEl = frag.querySelector(".tablet");
  const consoleEl = frag.querySelector(".console-game");
  const phoneEl = frag.querySelector(".phone");

  const categoryList = frag.querySelector(".category-list");
  homeEl.addEventListener("click", e => {
    rootEl.textContent = "";
    drawProductsList();
  });

  /******** 메인 상품페이지 ********/
  async function drawCategory(category) {
    const res = await api.get(`/products?category=${category}`);

    //  productsListEl.textContent = "";이 아니면 전상품의 이미지가 없어지지 않는다.
    productsListEl.textContent = "";

    // 데이터 안에 필요한 메인 타이틀과 이미지를 구하기 위해 for문을 사용한다.
    for (let i = 0; i < res.data.length; i++) {
      const frag = document.importNode(templates.productsLi, true);
      const productsLiEl = frag.querySelector(".productsLiEl");
      const imageEl = frag.querySelector(".image");
      const productsTitle = frag.querySelector(".title");

      // imageEl의 src 속성을 res.data[i].mainImgUrl로 만든다.
      // imageEl.setAttribute("src", res.data[i].mainImgUrl)과 같다
      imageEl.src = res.data[i].mainImgUrl;
      productsTitle.textContent = res.data[i].title;

      // 메인 이미지와 상품의 타이틀을 productsLiEl에 붙여준 뒤에 frag에 붙여준다.
      productsLiEl.appendChild(imageEl);
      productsLiEl.appendChild(productsTitle);
      productsListEl.appendChild(frag);

      // 메인 상품을 클릭하면 세부상품 목록이 나옴
      productsLiEl.addEventListener("click", e => {
        drawInformation(res.data[i].id);
        productsListEl.textContent = "";
        categoryList.textContent = "";
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
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}

/*************************** 세부 상품화면  ***************************/
async function drawInformation(liId) {
  // 페이지 그리는 함수 작성 순서

  // 1. 템플릿 복사
  const frag = document.importNode(templates.productsInfo, true);

  // 2. 요소 선택
  const infoEl = frag.querySelector(".infoEl");
  const homeEl = frag.querySelector(".home-button");
  homeEl.addEventListener("click", e => {
    rootEl.textContent = "";
    drawProductsList();
  });

  // 3. 필요한 데이터 불러오기
  // 4. 내용 채우기
  if (liId) {
    const res = await api.get(`/products/${liId}/`);
    const detailImgUrls = res.data.detailImgUrls;
    infoEl.setAttribute("src", detailImgUrls[0]);
    drawDescription(liId);
  }
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  rootEl.textContent = "";
  rootEl.appendChild(frag);
}

/*************************** 상품 정보 ***************************/
async function drawDescription(liId) {
  const res = await api.get(`/options?id=${liId}`);
  console.log(res.data[0].id);

  // 1. 템플릿 복사
  const frag = document.importNode(templates.description, true);

  // 2. 요소 선택
  const descriptionEl = frag.querySelector(".description");
  const priceEl = frag.querySelector(".price");
  const cartBtnEl = frag.querySelector(".cart-btn");
  const inputNumEl = frag.querySelector(".input-num");

  // 3. 필요한 데이터 불러오기
  descriptionEl.textContent = res.data[0].title;
  res.data[0].title;

  // 4. 내용 채우기
  frag.appendChild(descriptionEl);
  frag.appendChild(priceEl);

  // 5. 이벤트 리스너 등록하기
  inputNumEl.addEventListener("input", e => {
    priceEl.textContent = e.target.value * res.data[0].price;
    e.target.value * res.data[0].price;
    e.target.value;

    console.log(typeof res.data[0].id);
  });

  // 장바구니 버튼을 클릭하면 정보 보내기
  cartBtnEl.addEventListener("click", async e => {
    e.preventDefault();
    await api.post("/cartItems", {
      optionId: res.data[0].id, // 옵션은 내가 채워야 할 정보
      quantity: parseInt(inputNumEl.value), // 수량은 내가 채워야 할 정보
      ordered: false // 주문되지 않았다는 사실을 나타냄
    });
    drawCartList();
  });

  // 6. 템플릿을 문서에 삽입
  // 수량 증가 및 감소
  rootEl.appendChild(frag);
}

/*************************** 장바구니 ***************************/
async function drawCartList() {
  // 1. 템플릿 복사
  const frag = document.importNode(templates.cartUl, true);
  // 2. 요소 선택
  const cartUl = frag.querySelector('.ordered-list')
  // const productsListEl = frag.querySelector(".products-list");
  

  // 3. 필요한 데이터 불러오기
  const res = await api.get(`/cartItems?_expand=option`);

  // 4. 내용 채우기
  for (let i = 0; i < res.data.length; i++) {
    const frag2 = document.importNode(templates.cartLi, true)
    
    const cartList = frag2.querySelector('.cart-list');
    const cartDesc = frag2.querySelector(".cart-name");
    const cartQuan = frag2.querySelector(".cart-quantity");
    const cartPrice = frag2.querySelector(".cart-price");
    

    cartPrice.textContent = res.data[i].quantity * res.data[i].option.price;
    cartQuan.textContent = res.data[i].quantity;
    cartDesc.textContent = res.data[i].option.title;
    console.log(cartUl)
    cartUl.appendChild(frag2)
    
  }
  rootEl.textContent = "";
  rootEl.appendChild(frag);
    
  
  
  // 5. 이벤트 리스너 등록하기
  // 6. 템플릿을 문서에 삽입
  
  
}



/*************************** 로그인 분기처리 ***************************/
// 토큰이 존재하는 이상 로그인이 풀리지 않는다.
if (localStorage.getItem("token")) {
  drawProductsList();
} else {
  drawLoginForm();
}
