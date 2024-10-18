const product_list = document.querySelector('#productItems');
const all_products = document.querySelector('#totalProducts');
const shimmer_div = document.querySelector('#shimmerWrapper');
const load_more_btn = document.querySelector('#loadMoreBtn');
const category_checkboxes = document.querySelectorAll('.filter__category-checkbox');
const sort_dropdown = document.querySelector('#sort');
const search_input_field = document.querySelector('#searchInput');


let product_info = [];
let product_count = 0;
let sorted_products = [];

// Hit the api
async function fetchProductInfo() {
    enableShimmerEffect();  
    try {
        const response = await fetch('https://fakestoreapi.com/products',{mode:'cors'});
        if (response.ok) {
            const data = await response.json();
            product_info = data;
            all_products.textContent = `${product_info.length} Results`;
            renderProductInfo();
        }
         
    } catch (error) {
        console.error('API call failed:', error);
        errorMessageDisplay('No Products !!');
    } finally {
        disableShimmerEffect();
    }
}

// Enable shimmer
function enableShimmerEffect() {
    shimmer_div.style.display = 'grid'; // show cards
    product_list.style.display = 'none'; // Hide products 
}

// Disable shimmer
function disableShimmerEffect() {
    shimmer_div.style.display = 'none'; // Hide cards
    product_list.style.display = 'grid'; // Show products 
}

// Show error message
function errorMessageDisplay(message) {
    const error_container = Object.assign(document.createElement('div'), {
        className: 'error-message', innerHTML: `<b>${message}</b>`
    });
    product_list.appendChild(error_container);
}

// Render products :: sort products :: filter products
function renderProductInfo() {
    let error_box = document.querySelector(".error-message");

    if(!error_box){
    
    sorted_products = filterProducts(product_info);
    const sorted_products_recieved = arrangeProducts(sorted_products);
    const product_batch = sorted_products_recieved.slice(product_count, product_count + 10);

    if (product_count === 0) {
        product_list.innerHTML = ''; 
    }

    if (product_batch.length === 0) {
        load_more_btn.style.display = 'none'; 
        return;
    }

    product_batch.forEach(product => {
        const product_item = document.createElement('div');
        product_item.classList.add('products__item');
        product_item.innerHTML = `
            <div class="product__image">
                <img src="${product.image}" alt="${product.title}">
            </div>
            <div class="product__description">
                <p class="product_title">${product.title}</p>
                <p class="price">$${product.price}</p>
                <button class="products__like-button" aria-label="Like button">🤍</button>
            </div>`;

        const likeButton = product_item.querySelector('.products__like-button');
        likeButton.addEventListener('click', () => {
            if (likeButton.classList.toggle('liked')) {
                likeButton.innerHTML = '❤️'; // filled 
            } else {
                likeButton.innerHTML = '🤍'; // hollow 
            }
        });

        product_list.appendChild(product_item);
    });

    product_count += product_batch.length; 

    // Show - Hide load btn
    if (product_count >= sorted_products_recieved.length) {
        load_more_btn.style.display = 'none'; 
    } else {
        load_more_btn.style.display = 'block'; 
    }
        
    }

}

// Filter Products
function filterProducts(products) {
    const search_parameter = search_input_field.value.toLowerCase();

    const checked_categories = Array.from(category_checkboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    const filtered = products.filter(product => {
        const search_parameter_match = product.title.toLowerCase().includes(search_parameter);
        const checked_category_match = checked_categories.length > 0 ? checked_categories.includes(product.category) : true; // If no category is selected, include all products

        return search_parameter_match && checked_category_match;
    });

    all_products.textContent = `${filtered.length} Results`; 

    if (product_count >= filtered.length) {
        product_count = 0; 
    }

    return filtered; 
}


function arrangeProducts(products) {
    const sort_criteria = sort_dropdown.value;

    if (sort_criteria === 'low-to-high') {
        return products.sort((first_product, second_product) => first_product.price - second_product.price);
    } else if (sort_criteria === 'high-to-low') {
        return products.sort((first_product, second_product) => second_product.price - first_product.price);
    }

    return products;
}

load_more_btn.addEventListener('click', renderProductInfo);

sort_dropdown.addEventListener('change', () => {
    product_count = 0; 
    renderProductInfo();    
});

search_input_field.addEventListener('input', () => {
    product_count = 0; 
    renderProductInfo();     
});

category_checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
    product_count = 0; 
    renderProductInfo(); 
      
    });
});

window.onload = fetchProductInfo;

document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const filters = document.querySelector('.filter');

    hamburger.addEventListener('click', () => {
        filters.classList.toggle('active');
    });
});
