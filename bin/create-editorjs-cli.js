#!/usr/bin/env node
var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var minimatch = require('minimatch')
var program = require('commander')
var readline = require('readline')
var VERSION = require('../package').version

var TEMPLATE_DIR = path.join(__dirname, '../template')

var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)

var _exit = process.exit

// Re-assign process.exit because of commander
// TODO: Switch to a different command framework
process.exit = exit

// CLI

around(program, 'optionMissingArgument', function (fn, args) {
  program.outputHelp()
  fn.apply(this, args)
  return { args: [], unknown: [] }
})

before(program, 'outputHelp', function () {
  // track if help was shown for unknown option
  this._helpShown = true
})

before(program, 'unknownOption', function () {
  // allow unknown options if help was shown, to prevent trailing error
  this._allowUnknownOption = this._helpShown

  // show help if not yet shown
  if (!this._helpShown) {
    program.outputHelp()
  }
})

function createApplication (name ,dir) {
  var pkg = {
    "name": name,
    "version": '0.1.0',
    "discription": "",
    "author": "",
    "files": [
      "dist"
    ],
    "scripts": {
      "build" : "webpack --mode production",
      "build:dev" : "webpack --mode development --watch",
    },
    "dependencies" : {
      "@babel/core": "^7.3.4",
      "@babel/plugin-transform-runtime": "^7.2.0",
      "@babel/preset-env": "^7.3.4",
      "@babel/runtime": "^7.2.0",
      "babel-loader": "^8.0.2",
      "css-loader": "^1.0.0",
      "extract-text-webpack-plugin": "^4.0.0-beta.0",
      "mini-css-extract-plugin": "^1.6.2",
      "style-loader": "^0.23.1",
      "svg-inline-loader": "^0.8.0",
      "webpack": "^4.29.5",
      "webpack-cli": "^3.2.3"
    } 
  }

  if (dir !== '.') {
    mkdir(dir, '.')
  }

  /**
   * Create an app name from a directory path, fitting npm naming requirements.
   *
   * @param {String} pathName
   */

  function createAppName (pathName) {
    return path.basename(pathName)
      .replace(/[^A-Za-z0-9.-]+/g, '-')
      .replace(/^[-_.]+|-+$/g, '')
      .toLowerCase()
  }

  //create package.json
  write(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')

  //create src
  mkdir(dir, 'src')
  
  //
  copyTemplateMulti('src', dir + '/src', '*.js')
  copyTemplate('webpack-config', path.join(dir, 'webpack.config.js'))
  copyTemplate('gitignore', path.join(dir, '.gitignore'))
  copyTemplate('npmignore', path.join(dir, '.npmignore'))
  copyTemplate('README.md', path.join(dir, 'README.md'))
}

function mkdir (base, dir) {
  var loc = path.join(base, dir)

  console.log('   \x1b[36mcreate\x1b[0m : ' + loc + path.sep)
  mkdirp.sync(loc, MODE_0755)
}

/**
 * Copy multiple files from template directory.
 */

 function copyTemplateMulti (fromDir, toDir, nameGlob) {
  fs.readdirSync(path.join(TEMPLATE_DIR, fromDir))
    .filter(minimatch.filter(nameGlob, { matchBase: true }))
    .forEach(function (name) {
      copyTemplate(path.join(fromDir, name), path.join(toDir, name))
    })
}

/**
 * Check if the given directory `dir` is empty.
 *
 * @param {String} dir
 * @param {Function} fn
 */

 function emptyDirectory (dir, fn) {
  fs.readdir(dir, function (err, files) {
    if (err && err.code !== 'ENOENT') throw err
    fn(!files || !files.length)
  })
}

/**
 * Copy file from template directory.
 */

function copyTemplate (from, to) {
  write(to, fs.readFileSync(path.join(TEMPLATE_DIR, from), 'utf-8'))
}

/**
 * echo str > file.
 *
 * @param {String} file
 * @param {String} str
 */

function createAppName (pathName) {
  return path.basename(pathName)
    .replace(/[^A-Za-z0-9.-]+/g, '-')
    .replace(/^[-_.]+|-+$/g, '')
    .toLowerCase()
}

function write (file, str, mode) {
  fs.writeFileSync(file, str, { mode: mode || MODE_0666 })
  console.log('   \x1b[36mcreate\x1b[0m : ' + file)
}

function exit (code) {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion
  function done () {
    if (!(draining--)) _exit(code)
  }

  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    // submit empty write request and wait for completion
    draining += 1
    stream.write('', done)
  })

  done()
}


/**
 * Prompt for confirmation on STDOUT/STDIN
 */

 function confirm (msg, callback) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(msg, function (input) {
    rl.close()
    callback(/^y|yes|ok|true$/i.test(input))
  })
}



function main () {
  var destinationPath = program.args.shift() || '.'
  var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'

  emptyDirectory(destinationPath, function (empty) {
    if (empty || program.force) {
      createApplication(appName, destinationPath)
    } else {
      confirm('destination is not empty, continue? [y/N] ', function (ok) {
        if (ok) {
          process.stdin.destroy()
          createApplication(appName, destinationPath)
        } else {
          console.error('aborting')
          exit(1)
        }
      })
    }
  })
}

program
  .name('create-editorjs-module')
  .version(VERSION, '    --version')
  .usage('[options] [dir]')
  .parse(process.argv)

  if (!exit.exited) {
    main()
  }
  
  /**
   * Install an around function; AOP.
   */
  
  function around (obj, method, fn) {
    var old = obj[method]
  
    obj[method] = function () {
      var args = new Array(arguments.length)
      for (var i = 0; i < args.length; i++) args[i] = arguments[i]
      return fn.call(this, old, args)
    }
  }
  
  /**
   * Install a before function; AOP.
   */
  
  function before (obj, method, fn) {
    var old = obj[method]
  
    obj[method] = function () {
      fn.call(this)
      old.apply(this, arguments)
    }
  }