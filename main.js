let mealState=[]
let ruta='login'//login, register, order
let user={}

const strintoHTML=(s)=>{
    const parser= new DOMParser();
    const doc= parser.parseFromString(s,'text/html')
    return doc.body.firstChild
    
}

const renderItem=(item)=>{
    
    const elemnto =strintoHTML(`<li data-id="${item._id}">${item.name}</li>`)
    
    elemnto.addEventListener('click',()=>{
        const mealsList=document.getElementById('meals-list');
        Array.from(mealsList.children).forEach(x=>x.classList.remove('selected'))
        elemnto.classList.add('selected')
        const mealsIdInput= document.getElementById('meals-id')
        mealsIdInput.value= item._id
        
    })

    return elemnto
    
}

const renderOrder=(order, meals)=>{
    const meal= meals.find(meal=> meal._id === order.meal_id)
    const elemnto =strintoHTML(`<li data-id="${order._id}"> ${meal.name} - ${order.user_id}</li>`)
    
   

    return elemnto
    
}

const inicializaform=()=>{
    const orderForm= document.getElementById('order')
    orderForm.onsubmit=(e)=>{
        const submit= document.getElementById('submit')
        submit.setAttribute('disabled',true)
        
        e.preventDefault()
        const mealid= document.getElementById('meals-id')
        const mealidValue= mealid.value
        if(!mealidValue){
            alert('debe seleccionar un plato')
            submit.removeAttribute('disabled')
            return;
        }
        const order = {
            meal_id:mealidValue,
            user_id:user._id
        }
        fetch('https://serverless-crisgodev.vercel.app/api/order',{
            method:'POST',
            headers:{
                'Content-Type':'application/json',
                authorization: localStorage.getItem('token')
            },
            body:JSON.stringify(order)
        }).then(x=>x.json()).
        then(respuesta=> {
            const rendereOrder= renderOrder(respuesta, mealState)
            const orderlist= document.getElementById('orders-list')
            orderlist.appendChild(rendereOrder)
            submit.removeAttribute('disabled')

        })
    }
}
const inicializadatos=()=>{
    fetch('https://serverless-crisgodev.vercel.app/api/meals').
    then(response=> response.json())
    .then(data=>{
        mealState=data;
        const mealsList=document.getElementById('meals-list');
        const submit= document.getElementById('submit');
        const listitem= data.map(renderItem)
        mealsList.removeChild(mealsList.firstElementChild)
        listitem.forEach(element => mealsList.appendChild(element))
        
        submit.removeAttribute('disabled');
        fetch('https://serverless-crisgodev.vercel.app/api/order').
        then(response=> response.json()).
        then(orderdata=>{
            const orderlist= document.getElementById('orders-list')
            const Listorder= orderdata.map(orderdata=>renderOrder(orderdata,data))
            orderlist.removeChild(orderlist.firstElementChild)
            Listorder.forEach(element=>orderlist.appendChild(element))

        })
    });
}
 const renderApp=()=>{
     const token= localStorage.getItem('token')
     if(token){
         user=JSON.parse( localStorage.getItem('user'))
         return renderOrders();
    }
     renderLogin();
 }

 

 const renderOrders=()=>{

    const orderView= document.getElementById('order-view')
    document.getElementById('app').innerHTML=orderView.innerHTML
     inicializaform()
     inicializadatos()
 }

 const renderLogin=()=>{
    const logintemplate=document.getElementById('login-template')
 
    document.getElementById('app').innerHTML=logintemplate.innerHTML

    const loginform= document.getElementById('login-form')
    
    loginform.onsubmit=(e)=>{
        e.preventDefault()
        const email= document.getElementById('email').value
        const password= document.getElementById('password').value
        fetch('https://serverless-crisgodev.vercel.app/api/auth/login',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
        },
        body:JSON.stringify({email,password})
    }).then(x=>x.json()).
    then(respuesta=>{
        localStorage.setItem('token',respuesta.token)
        ruta='order'
        return respuesta.token
    }).
    then(token=>{
        return fetch('https://serverless-crisgodev.vercel.app/api/auth/me',{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                authorization:token,
            },
        })
    }). 
    then(x=>x.json()).
    then(fetcheruser=>{
        localStorage.setItem('user',JSON.stringify(fetcheruser))
        user=fetcheruser
        renderOrders()
    } )


    }
 }
window.onload=()=>{
    renderApp()
    
    
    // inicializaform()
    // inicializadatos()
    
}