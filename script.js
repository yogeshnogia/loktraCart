var CartApp = angular.module('CartApp',[]);

CartApp
  .service('Cart', ['$rootScope', 'Storage', function ($rootScope, Storage) { 
      var that = this;
    
      $rootScope.$on('onStorageModify', function()  {
        that.refresh();
      });
    
      this._cart = {};
    
      this._cartLookUp = function(id)  {
        return this._cart.hasOwnProperty(id) ? true : false;
      }
    
      this.getCart = function(){
        this._cart = Storage.fetch();
        if(!this._cart) { this._cart = {}; }
        
        return this._cart;
      };
  
      this.addItem = function(product){
        if(this._cartLookUp(product.id))  {
          this.changeQuantity(product.id);
        }else {
          this._newItem(product);
        }
        
        this.save();
      };
      
      this._newItem = function(product)  {
        product.quantity = 1;
        this._cart[product.id] = product;
      };
  
      this.addItems = function(products) {
        angular.forEach(products, function(product) {
          this.addItem(product);
        }, this);
      };
  
      this.save = function() {
        Storage.save(this._cart);
      };
  
      this.remove = function (id) {
        if(!--this._cart[id].quantity) { delete this._cart[id]; }
        this.save();
      };
  
      this.clear = function() {
        this._cart = {};
        Storage.remove();
      };
  
      this.persist = function() {};
  
      this.changeQuantity = function (id){
        this._cart[id].quantity++;
      };
  
      this.refresh = function() {
        $rootScope.$broadcast('onCartUpdate')
      };
  }]);

CartApp
  .factory('DummyData', function()  {
    return [
      {
        id : '01', name : 'Loktra Product 1', price : '$ 100',
        description : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
      },
      {
        id : '02', name : 'Loktra Product 2', price : '$ 200',
        description : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
      },
      {
        id : '03', name : 'Loktra Product 2', price : '$ 300',
        description : 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
      }
      
    ];
  });

CartApp
  .provider('Storage', function ()  {
    
    var identifier;
    
    return {
      setSourceIdentifier : function(id) {
        identifier = id;
      },
      
      $get : ['$rootScope', '$window', function($rootScope, $window) {
        
        angular.element($window).on('storage', function (event) {
          if (event.key === identifier) {
            $rootScope.$broadcast('onStorageModify');
          }
        });
        
        return {
          save : function(data)  {
            localStorage.setItem(identifier, JSON.stringify(data));
          },
      
          fetch : function() {
            return JSON.parse(localStorage.getItem(identifier));
          },
      
          remove : function()  {
            localStorage.removeItem(identifier);
          }
        };
      }]
    }
  });
  
CartApp
  .config(function(StorageProvider)  {
    StorageProvider.setSourceIdentifier('cart');
  });
  
CartApp
  .controller('ItemListController', ['$rootScope', '$scope', 'Cart', 'DummyData',
    function($rootScope, $scope, Cart, DummyData) {
      
      $scope.cart = Cart.getCart();
      $scope.products = DummyData;
      $scope.addProduct = function(index)  {
        Cart.addItem($scope.products[index]);
      };
      $scope.removeProduct = function(index)  {
        Cart.remove(index);
      };
      
      $rootScope.$on('onCartUpdate', function() {
        $scope.$apply(function()  {
          $scope.cart = Cart.getCart();
        });
      });
    }
  ]);