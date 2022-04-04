const area_metodos = $('#area_metodos');
const metodo_runge = $("#metodo_runge");
const metodo_euler = $("#metodo_euler");
const metodo_newton = $("#metodo_newton");
const span_decimales = $("#span_decimales");
const rango_decimales = $("#rango_decimales");
const div_ecuacion = $("#div_ecuacion");
const div_derivada = $("#div_derivada");
const span_forma = $("#span_forma");
const input_funcion = $("#input_funcion");
const span_forma_derivada = $("#span_forma_derivada");
const output_funcion_derivada = $("#output_funcion_derivada");
const x0 = $("#input_x0");
const y0 = $("#input_y0");
const h = $("#input_h");
const x = $("#input_x"); //x final
const resultado = $("#resultado");
const btn_calcular = $("#btn_calcular");
const btn_limpiar = $("#btn_limpiar");
const tabla_runge = $("#tabla_runge");
const tabla_euler = $("#tabla_euler");
const tabla_newton = $("#tabla_newton");
const funcion_yp = $(".funcion_yp");
let ecuacionOriginal;
let n = 0;
let decimales;


function minusculas(e) {
  e.value = e.value.toLowerCase();
};

// DECIMALES
decimales =  Number(rango_decimales.val());
span_decimales.text(decimales);
rango_decimales.on("input", function () {
  decimales = Number(rango_decimales.val());
  span_decimales.text(decimales);

  let renglones = $("table tbody tr").length;
  if(renglones > 0) {
    ejecutarMetodo();    
  }
});


let metodo = "metodo_runge";
mostrarSegunMetodo(metodo);

function mostrarSegunMetodo(metodo){
  funcion_yp.show();
  $("table").hide();
  if (metodo == "metodo_runge") {
    span_forma.text("f(x,y) =");
    span_forma_derivada.text("f'(x,y) =");
    div_ecuacion.addClass("col-12");
    div_ecuacion.removeClass("col-6");
    div_derivada.hide();
    tabla_runge.show();
  }
  if (metodo == "metodo_euler") {
    span_forma.text("f(x,y) =");
    span_forma_derivada.text("f'(x,y) =");
    div_ecuacion.addClass("col-12");
    div_ecuacion.removeClass("col-6");
    div_derivada.hide();
    tabla_euler.show();
  }
  if (metodo == "metodo_newton") {
    funcion_yp.hide();
    span_forma.text("f(x) =");
    span_forma_derivada.text("f'(x) =");
    div_ecuacion.addClass("col-6");
    div_ecuacion.removeClass("col-12");
    div_derivada.show();
    tabla_newton.show();
  }
  input_funcion.focus();
}

//LIMITAR CARACTERES A INGRESAR
input_funcion.on('input', function (e) {
  if (!/^[x-y0-9]*$/i.test(this.value)) {
    this.value = this.value.replace(/[^-.sincossqrt( ) * ^ / + x-y0-9]+/ig,"");
  }
});


btn_limpiar.click(function (e) { 
  e.preventDefault();
  limpiar();
});
function limpiar(){
  input_funcion.val("");
  output_funcion_derivada.val("");
  x0.val("");
  y0.val("");
  h.val("");
  x.val("");
  $('table tbody').empty();
  $('table tfoot').empty();
  input_funcion.focus();
}

function validarCampos(metodo) {
  campo_valido = validarInput(input_funcion,"ECUACIÓN");
  if (!campo_valido) {return false;}
  campo_valido = validarInput(x0,"x<sub>0</sub>");
  if (!campo_valido) {return false;}

  if(metodo != "metodo_newton") {
    campo_valido = validarInput(y0,"y<sub>0</sub>");
    if (!campo_valido) {return false;}
    campo_valido = validarInput(h,"h");
    if (!campo_valido) {return false;}
    campo_valido = validarInput(x,"x");
    if (!campo_valido) {return false;}
  }
  return true;
}
function validarInput(input, nombre_campo) {
  if (input.val() == "" || input.val() == -1 || input.val() == "-1") {
      mostrarToast('error', `Campo ${nombre_campo} vacio.`);
      input.focus();
      return false;
  }
  return true;
}
function mostrarToast(icono, mensaje, posicion) {
  if (posicion == null) {posicion = 'top-end'}
  const Toast = Swal.mixin({
     toast: true,
     position: posicion,
     showConfirmButton: false,
     timer: 2000,
     timerProgressBar: true,
     didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer)
        toast.addEventListener('mouseleave', Swal.resumeTimer)
     }
  })

  Toast.fire({icon: icono, title: mensaje})
}



area_metodos.click(function (e) {
  if (e.target.id == "metodo_runge") {
    metodo = "metodo_runge";
  }
  if (e.target.id == "metodo_euler") {
    metodo = "metodo_euler";
  }
  if (e.target.id == "metodo_newton") {
    metodo = "metodo_newton";
  }
  mostrarSegunMetodo(metodo);
});


btn_calcular.click(function(e) {
  e.preventDefault();
  ecuacionOriginal = input_funcion.val().toLowerCase();

  let ecuacionDerivada = math.derivative(ecuacionOriginal,'x');
  output_funcion_derivada.val(ecuacionDerivada);
  ejecutarMetodo();
});

function ejecutarMetodo() {  
  $('table tbody').empty();
  $('table tfoot').empty();

  if (metodo_runge.is(':checked')) {
    let camposValidados = validarCampos("metodo_runge");
    if (camposValidados) rungeKutta(Number(x0.val()),Number(y0.val()),Number(h.val()),Number(x.val()));
  }
  if (metodo_euler.is(':checked')) {
    let camposValidados = validarCampos("metodo_euler");
    if (camposValidados) eulerMejorado(Number(x0.val()),Number(y0.val()),Number(h.val()),Number(x.val()));
  }
  if (metodo_newton.is(':checked')) {
    let camposValidados = validarCampos("metodo_newton");
    if (camposValidados) newtonRapson(Number(x0.val()));
  }
}

function f(x, y) {
  let ecuacion = [];
  for (let i = 0; i < ecuacionOriginal.length; i++) {
    if (ecuacionOriginal[i] == 'x') {ecuacion += x;}
    else if (ecuacionOriginal[i] == 'y') {ecuacion += y;}
    else {ecuacion += ecuacionOriginal.charAt(i);}
    
  }
  return math.evaluate(ecuacion);
}

function derivar(ecuacion,valor) {
  let ecuacionDerivada = math.derivative(ecuacion, 'x').evaluate({x:valor});

  return ecuacionDerivada;
}

function agregarFooter(tabla,yTotal) {
  let variable = "y";
  if (tabla[0].id == "tabla_newton") {variable = "x"}
  let tfoot = /*html*/ `
  <tfoot class="text-center bg-dark text-light">
    <tr>
      <td colspan="8" class="fw-bold lead">${variable} = ${Number(yTotal).toPrecision(decimales)}</td>
    </tr>
  </tfoot>
  `
  tabla.append(tfoot);
}

function rungeKutta(x0,y0,h,x){
let i = 0,  //iteraciones
   k1 = 0,  //k1
   k2 = 0,  //k2
   k3 = 0,  //k3
   k4 = 0,  //k4
   y = 0;   //y

  xn = x0;
  yn = y0;
  n = parseInt((x - x0) / h, 10);

  // agregarRenglon(i, xn, yn, k1, k2, k3, k4, y);

  for (i = 0; i <= n+h; i++) {    
    k1 = f(xn , yn);
    // k2 = h * f(xn + (h*0.5) , yn + (k1*0.5));
    // k3 = h * f(xn + (h*0.5) , yn + (k2*0.5));
    // k2 = h * f(xn + (h/2) , yn + (k1/2));
    k2 = f(xn + (h/2) , yn + (h*k1/2));
    k3 = f(xn + (h/2) , yn + (h*k2/2));
    k4 = f(xn + h , yn + h*k3); // o h * f(yn + (h*k3))
    y = yn_mas_1(yn, h, k1, k2, k3, k4);
    
    agregarRenglon(i, xn, yn, k1, k2, k3, k4, y);

    xn += h;
    yn = y;
  }
  agregarRenglon(i, xn, yn, k1, k2, k3, k4, y);

  let yTotal = yn;
  agregarFooter(tabla_runge,yTotal);

  function yn_mas_1(yn, h, k1, k2, k3, k4) {
    //  return (yn + (1 / 6) * (k1 + (2*k2) + (2*k3) + k4) * h);
    //  return (yn + (k1/6) * (k2/3) + (k3/3) + (k4/6));
    //  return (yn + (h/2) * (k1 + (2*k2) + (2*k3) + k4));
     return (yn + (h/6) * (k1 + (2*k2) + (2*k3) + k4));
  }

  function agregarRenglon(i,xn,yn,k1,k2,k3,k4,y) {
    registro = /*html*/ `
    <tr>
      <th>${i}</th>
      <td>${Number(xn).toPrecision(decimales)}</td>
      <td>${Number(yn).toPrecision(decimales)}</td>
      <td>${Number(k1).toPrecision(decimales)}</td>
      <td>${Number(k2).toPrecision(decimales)}</td>
      <td>${Number(k3).toPrecision(decimales)}</td>
      <td>${Number(k4).toPrecision(decimales)}</td>
      <td>${Number(y).toPrecision(decimales)}</td>
    </tr>`
    $("#tabla_runge tbody").append(registro);
  }
}

function eulerMejorado(x0,y0,h,x){
  let i = 0,  //iteraciones
    yie = 0,  //y con dieresis
    xn_1 = 0, //Xn+1
    yn_1 = 0; //Yn+1

  xn = x0;
  yn = y0;
  n = parseInt((x - x0) / h, 10);

  // agregarRenglon(i, xn, yn, yie, yn_1);


  for (i = 0; i <= n+h; i++) {
    yie   = yn + h * f(xn , yn);
    xn_1  = xn + h;
    yn_1  = yn + (h/2) * (f(xn,yn) + f(xn_1,yie));
    
    agregarRenglon(i, xn, yn, yie, yn_1);

    xn += h;
    yn = yn_1;
  }
  agregarRenglon(i, xn, yn, yie, yn_1);

  let yTotal = yn;
  agregarFooter(tabla_euler,yTotal);
  
  function agregarRenglon(i, xn, yn, yie, yn_1) {

    registro = /*html*/ `
    <tr>
      <th>${i}</th>
      <td>${Number(xn).toPrecision(decimales)}</td>
      <td>${Number(yn).toPrecision(decimales)}</td>
      <td>${Number(yie).toPrecision(decimales)}</td>
      <td>${Number(yn_1).toPrecision(decimales)}</td>
    </tr>`
    $("#tabla_euler tbody").append(registro);
  }
}

function newtonRapson(x) {
  let i = 0,        // iteraciones
    xn = x,         // xn
    fxn = 0,        // f(xn)
    fpxn = 0,       // f'(xn)
    fcociente = 0,  // cociente de la funcion
    Ea = null       // error aproximado
  ;
  // agregarRenglon(i, xn, fxn, fpxn, fcociente, Ea);

  do {
    xanterior = xn;
    fxn = fnewton(xn);
    fpxn = derivar(ecuacionOriginal,xn);
    fcociente = fxn / fpxn;
    xn  = xn - fcociente;
    Ea = math.abs((xanterior-xn)/xn*100);

    if(i > 0)
      agregarRenglon(i, xanterior, fxn, fpxn, fcociente, Ea);

    i++;
  } while (Ea >= 0.0001);

  //vuelta de comprobación qu eya esta el error aprox. en 0
  xanterior = xn;
  fxn = fnewton(xn);
  fpxn = derivar(ecuacionOriginal,xn);
  fcociente = fxn / fpxn;
  xn  = xn - fcociente;
  Ea = math.abs((xanterior-xn)/xn*100);

  agregarRenglon(i, xanterior, fxn, fpxn, fcociente, Ea)

  let xFinal = xn;
  agregarFooter(tabla_newton,xFinal);
  

  function agregarRenglon(i, xn, fxn, fpxn, fcociente, Ea) {

    if (Ea == NaN || Ea == null) { campoEa = "" }
    else { campoEa = Number(Ea).toPrecision(decimales) }
    registro = /*html*/ `
    <tr>
      <th>${i}</th>
      <td>${Number(xn).toPrecision(decimales)}</td>
      <td>${Number(fxn).toPrecision(decimales)}</td>
      <td>${Number(fpxn).toPrecision(decimales)}</td>
      <td>${Number(fcociente).toPrecision(decimales)}</td>
      <td>${campoEa}</td>
    </tr>`
    $("#tabla_newton tbody").append(registro);
  }

  function fnewton(x) {
    let ecuacion = [];
    for (let i = 0; i < ecuacionOriginal.length; i++) {
      if (ecuacionOriginal[i] == 'x') {ecuacion += x;}
      // else if (ecuacionOriginal[i] == 'y') {ecuacion += y;}
      else {ecuacion += ecuacionOriginal.charAt(i);}
      
    }    
    return math.evaluate(ecuacion);
  }
}