var smBkApp = {};

smBkApp.containerEl = document.getElementById('container');
smBkApp.productsContainerEl = document.getElementById('products');
smBkApp.reviewContainerEl = document.getElementById('review');
smBkApp.totalEl = document.querySelector('.total');

smBkApp.currentStep = 1;
smBkApp.total = 0.00;

smBkApp.products = [];
smBkApp.stepsCompleted = [];

smBkApp.bikeIds = [];
smBkApp.itemsSelected = {};


smBkApp.init = function() {
	let _this = this;

	loadJSON('data.json',
		function(data) {
			_this.products = data.products;
			_this.loadStep(1);
		}
	);
}

smBkApp.loadStep = function(step_number) {
	var _this = this;
	switch(step_number) {
		case 1:
			this.buildProducts();

			document.querySelector('.next').onclick = function() {
				let valid = false;

				for (var key in _this.itemsSelected) {
					if(_this.bikeIds.includes(parseInt(key))) {
						valid = true;
					}
					break;
				}

				if(valid) {
					_this.loadStep(2);
				} else {
					alert('Select 1 or more bike before proceeding.');
				}
			};
			break;
		case 2:
			this.buildReview();

			document.querySelector('.next-review').onclick = function() {
				_this.loadStep(3);
			};
			break;
		case 3:
			document.getElementById('review-total-2').innerHTML = 'Total : $' + this.total;

			document.getElementById('checkout-form').addEventListener("submit", function(evt) {
		        evt.preventDefault();
		        _this.loadStep(4);
		    }, true);
			break;
		case 4:

		default:
			break;
	}

	this.containerEl.className = "step-" + step_number;
}


smBkApp.buildReview = function() {

	for (var key in this.itemsSelected) {
		let _this = this.itemsSelected[key];
		
		var obj = {
			id: parseInt(_this.getAttribute('data-id')),
			title: (_this.getAttribute('data-title')),
			price: parseFloat(_this.getAttribute('data-price')),
			type: _this.getAttribute('data-type'),
			qty: parseInt(_this.getAttribute('data-qty'))
		};

		console.log(obj);

		this.total += obj.price * obj.qty;

		let productTemplate = document.querySelector('.review-item');
		let cln = productTemplate.cloneNode(true);

		cln.querySelector('.title').innerHTML = obj.title;
		cln.querySelector('.qty').innerHTML = obj.qty;
		cln.querySelector('.price').innerHTML = '$' + (obj.price);

		cln.classList.remove('hidden');
		this.reviewContainerEl.appendChild(cln);
	}

	document.getElementById('review-total').innerHTML = '<b>Total :</b> $' + this.total;
	console.log(this.total);


}

smBkApp.buildProducts = function() {
	var _this = this;

	this.products.forEach(function(item, index) {
		let productTemplate = document.querySelector('.product');
		let cln = productTemplate.cloneNode(true);

		cln.setAttribute('data-id', item.id);
		cln.setAttribute('data-title', item.name);
		cln.setAttribute('data-type', item.product_type);
		cln.setAttribute('data-price', item.price);

		cln.querySelector('.title').innerHTML = item.name;
		cln.querySelector('.thumb').setAttribute('src', item.image);
		cln.querySelector('.price').innerHTML = '$' + (item.price);

		if(item.product_type == 'bike') {
			_this.bikeIds.push(item.id);
		}

		cln.querySelector('.qty').onchange = function() {
			let parent = this.parentNode.parentNode;
			let price = parseFloat(parent.getAttribute('data-price'));
			parent.setAttribute('data-qty', this.value);
		}

		cln.onclick = function(e) {
			let classNameClicked = e.target;
			if(classNameClicked.className == 'qty') return;

			var obj = {
				id: parseInt(this.getAttribute('data-id'))
			};

			let className = this.className;
			className = className.replace('product', '');

			if(className == '') {
				this.classList.add('selected');
				_this.itemsSelected[obj.id] = this;
			} else {
				this.classList.remove('selected');
				delete _this.itemsSelected[obj.id];
			}
		}

		cln.classList.remove('hidden');
		_this.productsContainerEl.appendChild(cln);

	});
}


smBkApp.init();

/* utilities */
function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}