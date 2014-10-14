Rails + Angular Tutorial
========================

The goal of this tutorial is to help you create a simple application that uses a Rails backend and an Angular frontend. This tutorial will cover this process step-by-step as much as possible.

> Note that some of the code discussed here is not optimized for production-level applications! This tutorial was written to be as simple as possible. The last step of this guide provides some ideas for how you can further improve on the code shown below.

If you have any problems, you can reference the code included in this repo.

Step 0: Pre-Requisites
----------------------
- Some knowledge of Rails ([https://www.railstutorial.org/](https://www.railstutorial.org/))
- Basic knowlege of Angular ([https://docs.angularjs.org/tutorial](https://docs.angularjs.org/tutorial))
- Rails installed on your system ([http://installrails.com/](http://installrails.com/))
- Bower installed on your system ([http://bower.io/](http://bower.io/))

Step 1: Create a New Rails App
--------------------------------------------
We will start by creating a fresh Rails application. In this case, we'd like to create our application without tests (we will be using RSpec later):

    rails new -T angularapp

Step 2: Configure and Install Bower Components
----------------------------------------------

We'll start our application by configuring Bower. Bower is a package manger and is used to help you organize assets in your application. In this tutorial, we will be using Bower to fetch and install the components we need to get Angular up and running.

> Using Bower isn't actually required, but if you decide not to use it, you will have to manually download and copy the appropriate Angular source code into your project.

For this project, Bower will need two files in our application: a `bower.json` file that tells Bower *what* to install, and a `.bowerrc` file that tells Bower *where* to install.

Create a file named `bower.json` in the root of your Rails app:

**bower.json**

    {
      "name": "AngularApp",
      "private": true,
      "ignore": [
        "**/.*",
        "node_modules",
        "bower_components",
        "test",
        "tests"
      ],
      "dependencies": {
        "lodash": "~2.4.1",
        "angular": "~1.2.22",
        "angular-ui-router": "~0.2.10",
        "restangular": "~1.4.0"
      }
    }

Using this file, Bower will install the necessary components to run angular. Note that we've also included some helpful libraries like [Restangular](https://github.com/mgonto/restangular) here, which will be helpful once we start writing Angular.

Next, create a file named `.bowerrc` in the root of your Rails app:

**.bowerrc**

    {
      "directory": "vendor/assets/components"
    }

With this file, Bower will know what directory to install components into.

Now that Bower has the files it needs, you can install your components:

    bower install

Step 3: Configure the Server
----------------------------

The `Gemfile` for this application will be pretty standard. We will be using [SQLite](http://www.sqlite.org/) for our DB as well as [RSpec](http://rspec.info/) for testing. A recommended `Gemfile` is shown below:

**Gemfile**

    source 'https://rubygems.org'

    # ruby
    ruby '2.1.2'

    # rails
    gem 'rails', '4.1.5'

    # db
    gem 'sqlite3'

    # front end
    gem 'sass-rails', '~> 4.0.3'
    gem 'uglifier', '>= 1.3.0'
    gem 'jquery-rails'

    group :development do
      gem 'spring-commands-rspec'
    end

    group :development, :test do
      gem 'rspec-rails', '~> 3.0.0'
      gem 'factory_girl_rails'
      gem 'faker'
    end

Once your `Gemfile` is set up, run:

**Terminal**

    bundle install

In addition to the `Gemfile`, we also need to make a minor addition to `config/application.rb`. Add the following line *inside* of the Application class:

**config/application.rb**

    ...

    config.assets.paths << Rails.root.join('vendor', 'assets', 'components')

    ...

The resulting file should look similar to:

**config/application.rb**

    require File.expand_path('../boot', __FILE__)

    # Pick the frameworks you want:
    require "active_model/railtie"
    require "active_record/railtie"
    require "action_controller/railtie"
    require "action_mailer/railtie"
    require "action_view/railtie"
    require "sprockets/railtie"
    # require "rails/test_unit/railtie"

    # Require the gems listed in Gemfile, including any gems
    # you've limited to :test, :development, or :production.
    Bundler.require(*Rails.groups)

    module Angularapp
      class Application < Rails::Application
        config.assets.paths << Rails.root.join('vendor', 'assets', 'components')
      end
    end

This will tell Rails to add your previously installed Bower components to the Rails [asset pipeline](http://guides.rubyonrails.org/asset_pipeline.html), so that you can use them in your app.

Step 4: Configure Assets
------------------------

Next we need to let Rails know what assets we'll be using in our application. In `assets/javascripts/application.js`, you can replace the pregenerated code with this:

**assets/javascripts/application.js**

    /*
     ==== Standard ====
     = require jquery

     ==== Angular ====
     = require angular

     ==== Angular Plugins ====
     = require lodash
     = require restangular
     = require angular-ui-router

     = require_self
     = require_tree .
     */

This is what will actually include the JavaScript to run Angular in the application.

Step 5: Configure Rails Routes
------------------------------

Our Rails app is pretty simple, so we are just going to redirect all of our requests to one controller and action for the time-being.

In `config/routes.rb`, copy this code:

**config/routes.rb**

    ...

    get "*path", to: "application#index"
    root 'application#index'

    ...

It should be the only route definition in the file at this time.

In `controllers/application_controller.rb`, add this new action:

**controllers/application_controller.rb**

    ...

    def index
      render text: "hello world", layout: "application"
    end

    ...

At this point, you should be able to run your application. It should display 'hello world', no matter what url you type in the browser, because of our new route rules. If you have a browser inspector up, you should also see that Angular is being included on the page.

Step 6: Create a Rails API
--------------------------

Now we need to write some Rails code for our application. The goal here to to create a *Rails API* that will provide data, in the form of JSON, to our Angular frontend.

To make our Rails code cleaner and easier to understand, we are going to *namespace* all of our backend code under the term "API".

Start by creating a base API controller, `controllers/api/base_controller.rb`:

**controllers/api/base_controller.rb**

    class Api::BaseController < ApplicationController
      skip_before_filter :verify_authenticity_token
      respond_to :json
    end

This is just a simple controller for our future API controllers to inherit from. It disables authenticity token checks and makes sure that our controllers respond to JSON by default.

At this point, we need some data. We'll pretend that for this tutorial, we are building an application that lists video games in a store. To begin with, create a model:

**Terminal**

    rails g model game name:text description:text
    rake db:migrate

Next, we need to fill the DB with some data. In `db/seeds.rb`, create some sample games like:

**db/seeds.rb**

    Game.create!(name: "Halo", description: "Shooter Game")
    Game.create!(name: "Kingdom Hearts", description: "Japanese RPG")
    Game.create!(name: "Fire Emblem", description: "Turn Based Strategy Game")
    Game.create!(name: "Hitman", description: "Stealth Game")
    Game.create!(name: "Tetris", description: "Puzzle Game")
    Game.create!(name: "Harvest Moon", description: "Japanese RPG")
    Game.create!(name: "Pacman", description: "Arcade Game")

Then run:

**Terminal**

    rake db:seed

Next, create an Api::GamesController class at `controllers/api/games_controller.rb`.

> You can do this on the command line by using the `rails g controller` command, but here we will manually create the file to avoid having Rails automatically create views, assets, etc, since they are not needed.

**controllers/api/games_controller.rb**

    class Api::GamesController < Api::BaseController
      def index
        respond_with :api, games
      end

      def show
        respond_with :api, game
      end

      private

      def games
        @games ||= Game.all
      end

      def game
        @game ||= game.find(params[:id])
      end
    end

> Note the `respond_wth` function and how it includes `:api`. When you are working with namespaced resources in Rails, you must provide a symbol to `respond_wth` in order for it to set your response headers correctly. Additionally, because the `Api::BaseController` class has declared that its children respond to JSON, it is not necessary to redeclare that in this class.

Before this data can be accessed, a new route needs to be defined in `config.routes.rb`. This new route will reveal the API and should be placed *above* the previous rules that redirect all requests to the application's index action:

**routes.rb**

    ...

    namespace :api do
      resources :games
    end

    ...

If you run your application at this point, you should see that urls such as:

- /api/games.json
- /api/games/1.json

Now return JSON data in the browser.

Step 7: Finish the Backend
--------------------------

At this point you should write some tests to make sure that everything is working correctly. For this project, we have a few extra considerations due to how our API works.

First, in order for RSpec to behave properly when retrieving JSON data, you must tell it what format the data will be in. You can do this by setting `request.env["HTTP_ACCEPT"] = 'application/json'` in your specs. Failure to do this will cause RSpec to error out.

Additionally, once you receive data, it will be in a JSON format. In order to read the data, you will have to wrap your response in a JSON parse function like this: `JSON.parse(response.body)`.

Your specs should look similarly to this:

**spec/controllers/api/games\_controller\_spec.rb**

    require 'rails_helper'

    RSpec.describe Api::GamesController, type: :controller do
      before(:each) do
        request.env["HTTP_ACCEPT"] = 'application/json'
      end

      describe 'GET index' do
        let!(:game) { Game.create!(name: "Test", description: "Test") }
        let!(:game2) { Game.create!(name: "Test2", description: "Test2") }

        it "lists the games" do
          get :index
          expect(JSON.parse(response.body).count).to eq(2)
          expect(JSON.parse(response.body).first["id"]).to eq(game.id)
        end
      end

      describe 'GET show' do
        let!(:game) { Game.create!(name: "Test", description: "Test") }
        let!(:game2) { Game.create!(name: "Test2", description: "Test2") }

        it "shows the game" do
          get :show, id: game2.id
          expect(JSON.parse(response.body)["id"]).to eq(game2.id)
        end
      end
    end

Step 8: Create the Angular Frontend
-----------------------------------

Now that our backend is working, we can start creating a frontend. We'll start by setting up a new Angular module as well as some configuration details. In `app/assets/javascripts/application.js`, add the following after the require directives:

**app/assets/javascripts/application.js**

    ...

    var APP = angular.module('Games', [
      'ui.router',
      'templates',
      'restangular'
      ]);

    APP.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', 'RestangularProvider',
      function($stateProvider, $urlRouterProvider, $locationProvider, RestangularProvider){
        RestangularProvider.setBaseUrl("/api");
        RestangularProvider.setDefaultRequestParams({format: "json"});

        $locationProvider.html5Mode(true);

        $urlRouterProvider.otherwise("/games");

        $stateProvider
          .state('games', {
            url: "/games",
            abstract: true,
            template: "<div ui-view></div>"
          })
          .state('games.list', {
            url: "",
            templateUrl: "games/index.html",
            controller: "GamesListController"
          })
          .state('games.show', {
            url: "/:id",
            templateUrl: "games/show.html",
            controller: "GamesShowController"
          });
      }]);

This code sets up a basic Angular module and configures it to use certain routes and templates in our application. Here we also set up Restangular, which is now configured to always hit our Rails API endpoints when requesting data: `RestangularProvider.setBaseUrl("/api");`.

Now that we have an Angular module, we need to add the `ng-app` directive to `app/views/layouts/application.html`, so that Angular knows to take over for Rails:

**app/views/layouts/application.html**

    <!DOCTYPE html>
    <html ng-app="Games">
    <head>
      <title>Angular App</title>
      <%= stylesheet_link_tag    'application', media: 'all' %>
      <%= javascript_include_tag 'application' %>
      <%= csrf_meta_tags %>
    </head>
    <body>
      <div id="container">
        <div ui-view></div>
      </div>
    </body>
    </html>

> We've also added a `ui-view` directive to our template. Since we are using AngularUI Router in our module, this replaces the traditional `ng-view` directive.

You'll notice that we've defined two Angular controllers and templates above, so now we need to create those as well. Since we will be generating several files, you should create some new directories to keep them organized:

- assets/javascripts/angular/
- assets/javascripts/angular/controllers/
- assets/javascripts/angular/templates/games/

Now for the actual files:

**assets/javascripts/angular/controllers/games.list.js**

    APP.controller('GamesListController', ['$scope', 'Restangular', function($scope, Restangular) {
      Restangular.all("games").getList().then(function(games) {
        $scope.games = games;
      });
    }]);

**assets/javascripts/angular/controllers/games.show.js**

    APP.controller('GamesShowController', ['$scope', 'Restangular', '$stateParams',
      function($scope, Restangular, $stateParams) {
        Restangular.one("games", $stateParams.id).get().then(function(game) {
          $scope.game = game;
        });
    }]);

These controllers do simple get requests for our API data, and use Restangular to simplify the retreival.

**assets/javascripts/angular/templates/index.html**

    <table>
      <tr>
        <th>Name</th>
        <th>Description</th>
      </tr>
      <tr ng-repeat="game in games" ui-sref="games.show({id: game.id})">
        <td>{{game.name}}</td>
        <td>{{game.description}}</td>
      </tr>
    </table>

**assets/javascripts/angular/templates/show.html**

    <h1>{{game.name}}</h1>
    <p>{{game.description}}</p>

In order for our templates to function correctly, we need to place them into a template cache for Angular to read from. The cache can be setup by adding the following file to your app:

**app/assets/javascripts/angular/templates.js.erb**

    angular.module('templates', []).

    run(['$templateCache', function($templateCache) {
      <%
        environment.context_class.instance_eval { include ActionView::Helpers::JavaScriptHelper }
        app_root  = File.expand_path('../../angular', __FILE__)
        templates = File.join(app_root, %w{templates ** *.html})

        Dir.glob(templates).each do |f|

          depend_on(f)
          key = f.gsub(%r(^#{app_root}/templates/),'')
          content = environment.find_asset(f).body
      %>
      $templateCache.put("<%= key %>", "<%= escape_javascript(content) %>");
      <% end %>
    }]);

> This code is a little confusing, but it exists to load the templates from inside our assets directory. It is possible to set up templates for Angular without using a cache like this, but you must place the template files in the `public/` directory instead. Also note that this file uses some relative paths, so if you move it to a different location , you will need to update the code.

Once this code is in place, you should be able to run your app and see a list of games and be able to interact with the list by clicking on items. Feel free to experiment with the frontend templates by adding or removing code.

> Because we are now using a template cache, you may run into an issue where templates don't update for changes you've made. If this happens, run `rake tmp:clear` in your Terminal.

Step 9: Improvements
--------------------

Now that we have a working application, there are a few things that can be done to optimize the code.

One great option for optimization is to install the [slim-rails gem](https://github.com/slim-template/slim-rails). Slim can be used to reduce the amount of code in the application templates as well as increase the readability of html.

Another improvement we can make is in our specs:

**spec/controllers/api/games\_controller\_spec.rb**

    ...

    describe 'GET index' do
      let!(:game) { Game.create!(name: "Test", description: "Test") }
      let!(:game2) { Game.create!(name: "Test2", description: "Test2") }

      it "lists the games" do
        get :index
        expect(JSON.parse(response.body).count).to eq(2)
        expect(JSON.parse(response.body).first["id"]).to eq(game.id)
      end
    end

    ...

Notice that `JSON.parse(response.body)` is a complicated function call that is repeated several times. We can simplfy this by declaring a new module in `spec/rails_helper.rb` that rolls this function into a single command:

**spec/rails_helper.rb**

    ...

    ActiveRecord::Migration.maintain_test_schema!

    module JsonHelpers
      def response_json
        @response_json ||= JSON.parse(response.body)
      end
    end

    RSpec.configure do |config|
      config.include JsonHelpers, type: :controller

    ...

You will need to add the module block as well as the config.include line to the pre-existing code. This will allow you to simply call `response_json` in your specs. Here is an example:

**spec/controllers/api/games\_controller\_spec.rb**

    ...

    describe 'GET index' do
      let!(:game) { Game.create!(name: "Test", description: "Test") }
      let!(:game2) { Game.create!(name: "Test2", description: "Test2") }

      it "lists the games" do
        get :index
        expect(response_json.count).to eq(2)
        expect(response_json.first["id"]).to eq(game.id)
      end
    end

    ...

The End
-------

That's it! You should now have a very simple, but functioning Rails application with an Anuglar frontend. Feel free to use this project as a base to build more complex applications and to further your programming skills!
