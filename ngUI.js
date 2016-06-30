/**
 * ngUI.js
 * @version 1.0.0
 * @author Fábio Nogueira <fabio.bacabal@gmail.com>
 * @description text
 * @param {Object} $scope
 * @param {Object} publics Métodos públicos do component
 * @param {HTMLElement} $element angular.element
 * @param {String} name Nome da instância do componente
 */

(function(){
    var ngUI, ngUIModule, $modules = {};
    
    angular.module('ngUI',[])
        .service('ngUI', [function(){
            return ngUI; 
        }])
        .service('ngUIModule', [function(){
            return ngUIModule; 
        }]);
    
    ngUIModule = function($scope){
        $scope.$$isUIModule = true;
    };
    ngUI = {
        /**
         * Registra um componente
         */
        register: function($scope, publics, $element, name){
            var $scopeModule = getModule($scope);

            if ($scopeModule){
                name = $element.attr('name') || name;
                initScopeModule($scopeModule);

                if (name){
                    publics = publics || {};
                    setObservable(publics, $scopeModule);
                    $modules[$scope.$id][name] = publics;
                }
            }
        },
        
        /**
         * Retorna um json referente aos valores definidos no atributo properties ou na tag properties:
         * @example
         *      <div properties='{"key":"value"}'></div>
         *      <div>
         *          <properties key1="value1" key2="value2"></properties>
         *      </div>
         * @param {type} element HTMLElement
         * @returns {Object}
         */
        attributesToJson: function (element) {
            var i, propertiesElement,
                json = {},
                attr = element.getAttribute('properties');

            if (attr){
                try{json = JSON.parse(attr)}catch(_e){json={};}
            }else{
                propertiesElement = element.children[0];
                if (propertiesElement && propertiesElement.localName==='properties'){
                    attr = propertiesElement.attributes;
                    for (i = 0; i < attr.length; i++) {
                        json[attr[i].name] = attr[i].value;
                    }
                }
            }

            if (element.$properties){
                for (i in element.$properties){
                    json[i] = element.$properties[i];
                }
                delete(element.$properties);
            }

            return json;
        }
    };
    
    function initScopeModule($scope){
        if ($scope.$$uiModuleInit) return;
        
        $modules[$scope.$id] = {};
        $scope.$$uiModuleInit = true;
        
        $scope.$UI = function(name){
            return $modules[$scope.$id][name];
        };
        $scope.$on('destroy', function(){
            var i, o=$modules[$scope.$id];
            
            for (i in o){
                delete(o[i].$_observable_listeners);
                delete(o[i].$_observable_context);
            }
            
            delete($scope.$UI);
            delete($modules[$scope.$id]);
        });
    }
    function getModule($scope){
        while ($scope){
            if ($scope.$$isUIModule) return $scope;
            $scope = $scope.$parent;
        }
        return null;
    }
    
    /**
     * @memberOf js.observable
     * @function
     * @param {String} event
     * @param {Array} args
     * @param {Object} context
     */
    function emit(event, args, context) {
        var i, listeners = this.$_observable_listeners[event];

        if (listeners) {
            args = alight.f$.isArray(args) ? args : [args];
            for (i = 0; i < listeners.length; i++) {
                listeners[i].apply(context || this.$_observable_context || this, args);
            }
        }
    }
    
    /**
     * @memberOf js.observable
     * @function
     * @param {String} event
     * @param {Function} cb
     * @returns {js.observable}
     */
    function on(event, cb) {
        var
                listeners = this.$_observable_listeners;

        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(cb);

        return this.$_observable_context || this;
    }
    
    /**
     * Injeta os métodos on e emit em um objeto permitido que sejam manipulados eventos customizados
     * @class js.observable
     * @param {Object} obj
     * @param {Object} context
     * @returns {Object}
     */
    function setObservable (obj, context) {
        if (!obj.$_observable_listeners) {
            obj.$_observable_listeners = {};
            obj.$_observable_context = context;
            obj.emit = emit;
            obj.on = on;
        }
        return obj;
    };
}());
