const BASE_URL = "http://localhost:3000";
const TRAINERS_URL = `${BASE_URL}/trainers`;
const POKEMONS_URL = `${BASE_URL}/pokemons`;
// mainContainer is the main div that we will be appending our cards to.
const mainContainer = document.querySelector('main');

// first we make a GET to the TRAINERS_URl
fetch(TRAINERS_URL)
.then(resp => resp.json())
.then(trainers => {
  // Trainers is an array of trainer Objects, so we can iterate over that array.
  trainers.forEach(trainer => {
    // We then take each trainer object and make a binding called html 
    // this binding stores out HTML and interpolates the trainer info. 
    const html = `
    <div class="card" data-id=${trainer.id}><p>${trainer.name}</p>
      <button data-trainer-id=${trainer.id}>Add Pokemon</button>
      <ul data-trainer-ul=${trainer.id}>
      </ul>
    </div>  
    `;
    // We then reference the mainContainer binding and use insertAdjecentHTML so we can 
    // add the html binding to the DOM. 
    mainContainer.insertAdjacentHTML('beforeend', html);
    // Because the ul that we need is being created on the fly, after we added 
    // it to the DOM (See line 24) we can querySelect it through its data attribute. 
    // I chose this over a id or class for future implications but you could have done this
    // with those as well. 
    const ul = document.querySelector(`[data-trainer-ul='${trainer.id}']`);

    //within our first iteration we then iterate over the trainer.pokemons array
    trainer.pokemons.forEach(poke => {
      // for each poke object we insertAdjacentHTML, on the ul binding from above (line 29)
      ul.insertAdjacentHTML('beforeend', `
      <li>${poke.nickname} (${poke.species}) 
        <button class="release" data-pokemon-id=${poke.id}>Release</button>
      </li>
      `);
    })
  })
});


// EVENT DELEGATOR:
// Instead of putting an event listener on every button which is more expensive memory wise 
// and not really super practicle, we just put a listener over the highest parent element.

mainContainer.addEventListener('click', e => {
  //use the innerText we can check if the event is the specific button we need. 
  // we can also check if the number of li's is 6 or less to allow for more pokemon to be added.
  // to check that we looked at e.target(the button).nextElementSibling(the ul below it).childElementCount(the lis)
  if (e.target.innerText === "Add Pokemon" && e.target.nextElementSibling.childElementCount < 6){
    // stored the trainerId in this variable so it is readable and can be used later just in case.
    const trainerId = e.target.dataset.trainerId;


    // we make a post request to pokemons url.
    // note there is no form in this lab, the only requirement is that we send over the 
    // trainer id, which we do in the body.
    // This requirement we given to us by the specs.
    fetch(POKEMONS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "trainer_id": trainerId
      })
    })
    .then(resp => resp.json())
    .then(poke => {
      // When we get a response from the server
      // we need a way to grab the ul, so I grabbed it by using querySelector on the 
      // addButtons parent element.
      const ul = e.target.parentElement.querySelector('ul');
      // this code is identical to the code on lines 34 - 38.  
      ul.insertAdjacentHTML('beforeend', `
      <li>${poke.nickname} (${poke.species}) <button class="release" data-pokemon-id=${poke.id}>Release</button></li>
      `);
    });
// Otherwise if the button's inner text says Release do this:
  } else if (e.target.innerText === "Release"){
    // make a delete request to "http://localhost:3000/pokemons/:pokemon_id"
    // this is given to us by the specs. 
    // the only requirement is to specify the method.
    fetch(POKEMONS_URL + `/${e.target.dataset.pokemonId}`, {
      method: 'DELETE'
    })
    .then(resp => resp.json())
    .then(() => {
      // we use an anonymous function to then wait for the server to respond and then
      // we remove the entire list element.
      // This is an example of pessimistic (de)rendering 
      // if we placed line 95 before the fetch that is an example of 
      // optimistic (de)rendering, because we are not wating for the server to respond
      // before we make a change to the DOM
      e.target.parentElement.remove();
    })
  }
})
