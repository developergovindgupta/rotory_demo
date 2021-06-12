(function () {
	const pageControler = {
		apiresult: null,
		productDetailCloneNode: null,
		filterValues: {
			minPrice: 0,
			maxPrice: 1000,
			gearBoxType: 0,
			fuelType: 0,
		},
		displayData: null,
		init() {
			let productList = document.querySelector('.product-list');
			let productDetailNode = productList.querySelector('.product-detail');
			this.productDetailCloneNode = productDetailNode.cloneNode(true);
			productDetailNode.remove();
			this.register_events();
			this.fetch_data();
		},
		register_events() {
			document.querySelector('.filters .price-min-value').addEventListener('input', pageControler.on_price_min_value_slide);
			document.querySelector('.filters .price-max-value').addEventListener('input', pageControler.on_price_max_value_slide);
			document.querySelector('.filters .ddlGearBoxType').addEventListener('change', pageControler.on_ddlGearBoxType_change);
			document.querySelector('.filters .ddlFuelType').addEventListener('change', pageControler.on_ddlFuelType_change);
			document.querySelector('.filters .btn-apply-filter').addEventListener('click', pageControler.on_apply_filter);

			document.querySelector('.result-sort-order.ddlSortData').addEventListener('change', pageControler.on_ddlSortData_change);
		},
		on_price_min_value_slide(e) {
			let min = +this.getAttribute('min');
			let max = +this.getAttribute('max');
			let val = +this.value;
			let minPrice = max + min - val;

			document.querySelector('.filters .price-slider-values .span-min-value').innerHTML = '$' + minPrice;
			pageControler.filterValues.minPrice = minPrice;
		},
		on_price_max_value_slide(e) {
			let min = +this.getAttribute('min');
			let max = +this.getAttribute('max');
			let val = +this.value;

			document.querySelector('.filters .price-slider-values .span-max-value').innerHTML = '$' + val;
			pageControler.filterValues.maxPrice = val;
		},
		on_ddlGearBoxType_change(e) {
			pageControler.filterValues.gearBoxType = +this.value;
		},
		on_ddlFuelType_change(e) {
			pageControler.filterValues.fuelType = +this.value;
		},
		on_apply_filter(e) {
			let filter = pageControler.filterValues;
			let data = pageControler.apiresult.filter((p) => {
				let result = true;
				if (filter.minPrice > p.Rate) {
					return false;
				}
				if (filter.maxPrice < p.Rate) {
					return false;
				}
				switch (filter.gearBoxType) {
					case 0: //both
						break;
					case 1: //auto
						if (p.Gearbox_type !== 'auto') {
							return false;
						}
						break;
					case 2: //manual
						if (p.Gearbox_type !== 'manual') {
							return false;
						}
						break;
				}
				switch (filter.fuelType) {
					case 0: //all
						break;
					case 1: //Petrol
						if (p.Fuel_type !== 'Petrol') {
							return false;
						}
						break;
					case 2: //Diesel
						if (p.Fuel_type !== 'Diesel') {
							return false;
						}
						break;
					case 3: //Hybrid
						if (p.Fuel_type !== 'Hybrid') {
							return false;
						}
						break;
				}
				return result;
			});

			pageControler.show_result(data);
		},
		on_ddlSortData_change(e) {
			let sortOrder = +this.value;
			if (sortOrder == 0) {
				pageControler.on_apply_filter();
				return;
			}

			let data = pageControler.displayData.sort((a, b) => {
				//Horse Power
				if (sortOrder == 1) {
					return a.Horsepower > b.Horsepower ? -1 : 1;
				} else {
					return +a.Year > +b.Year ? -1 : 1;
				}
			});
			pageControler.show_result(data);
		},
		fetch_data() {
			fetch('./js/apidata.json').then((result) => {
				result.json().then((data) => {
					pageControler.apiresult = data;
					pageControler.show_result(data);
					pageControler.set_slider_min_max_value(data);
				});
			});
			/*
            ==========================================================================================================
            Getting Following Error while fetching api data from localhost.
            ==========================================================================================================
            Access to fetch at 'https://jsonkeeper.com/b/MRTH' from origin 'http://127.0.0.1:5500' has been blocked 
            by CORS policy: Response to preflight request doesn't pass access control 
            check: No 'Access-Control-Allow-Origin' header is present on the requested resource. 
            If an opaque response serves your needs, set the request's mode to 'no-cors' to fetch the resource with CORS disabled.
            */
			// fetch('https://jsonkeeper.com/b/MRTH').then((result) => {
			//     console.log(result)
			//     // result.json().then(data => {
			//     //     console.log(data);
			//     //     pageControler.apiresult = data;
			//     // });
			// });
		},
		set_slider_min_max_value(data) {
			let minPrice = 0;
			let maxPrice = 0;
			data.forEach((x) => {
				if (x.Rate < minPrice || minPrice === 0) {
					minPrice = x.Rate;
				} else if (x.Rate > maxPrice || maxPrice === 0) {
					maxPrice = x.Rate;
				}
			});
			let minSlider = document.querySelector('.filters .price-min-value');
			minSlider.setAttribute('min', minPrice);
			minSlider.setAttribute('max', maxPrice / 2);
			minSlider.value = maxPrice / 2;

			let maxSlider = document.querySelector('.filters .price-max-value');
			maxSlider.setAttribute('min', maxPrice / 2);
			maxSlider.setAttribute('max', maxPrice);
			maxSlider.value = maxPrice;

			document.querySelector('.filters .price-slider-values .span-min-value').innerHTML = '$' + minPrice;
			document.querySelector('.filters .price-slider-values .span-max-value').innerHTML = '$' + maxPrice;

			pageControler.filterValues.minPrice = minPrice;
			pageControler.filterValues.maxPrice = maxPrice;
		},
		show_result(data) {
			let productList = document.querySelector('.product-list');
			productList.innerHTML = '';
			if (data) {
				data.forEach((productDetail) => {
					let productDetailNode = pageControler.productDetailCloneNode.cloneNode(true);
					productList.appendChild(productDetailNode);
					pageControler.update_product_detail(productDetailNode, productDetail);
				});
				document.querySelector('.records-found').innerHTML = data.length;
			}
			pageControler.displayData = data;
		},
		update_product_detail(productDetailNode, productDetail) {
			productDetailNode.querySelector('.product-name').innerHTML = productDetail.Year + ' '+  productDetail.Name + '('+productDetail.Horsepower+')';
			productDetailNode.querySelector('.product-image img').src = productDetail.Image;
			productDetailNode.querySelector('.product-price').innerHTML = '$' + productDetail.Rate + '/Day';
			//Product Info
			productDetailNode.querySelector('.product-info .category').innerHTML = productDetail.Category;
			productDetailNode.querySelector('.product-info .gearbox-type').innerHTML = productDetail.Gearbox_type;
			productDetailNode.querySelector('.product-info .capacity').innerHTML = productDetail.Capacity + ' Persons';
			productDetailNode.querySelector('.product-info .fuel-type').innerHTML = productDetail.Fuel_type;
		},
	};
	pageControler.init();
})();
