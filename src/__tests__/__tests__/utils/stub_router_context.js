import React from "react"; 

let stubRouterContext = (Component, props, stubs) => {
    function RouterStub() { }

    Object.assign(RouterStub, {
      makePath () {},
      makeHref () {},
      transitionTo () {},
      replaceWith () {},
      goBack () {},
      getCurrentPath () {},
      getCurrentRoutes () {},
      getCurrentPathname () {},
      getCurrentParams () {},
      getCurrentQuery () {},
      isActive () {},
      getRouteAtDepth() {},
      setRouteComponentAtDepth() {}
    }, stubs);

    return React.createClass({
      childContextTypes: {
        router: React.PropTypes.func,
        routeDepth: React.PropTypes.number
      },

      getChildContext () {
          return {
            router: RouterStub,
            routeDepth: 0
          };
      },

      render () {
          return <Component {...props} />;
      }
    });
};

export default stubRouterContext;
