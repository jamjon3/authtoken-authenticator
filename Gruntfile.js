//Gruntfile
'use strict';

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);

    //Initializing the configuration object
    grunt.initConfig({
        // Task configuration
        // Task configuration
        clean: {
            options: {
                "no-write": false, // Change to true for testing
                force: true
            },
            build: [
                'public/assets/**/*',
                'cache/*',
                'logs/*',
                'coverage/*',
                '!**/README.md'
            ],
            templatewrapper: [
                'templates/include/*'
            ]
        },
        php: {
            dist: {
                options: {
                    hostname: '127.0.0.1',
                    port: 8080,
                    base: 'public',
                    keepalive: false,
                    open: false
                }
            }
        },
        composer: {
            options: {
                usePhp: false,
                cwd: '.',
                flags: ['ignore-platform-reqs']
            }
        },
        browserSync: {
            dist: {
                bsFiles: {
                    src: [
                        'public/assets/stylesheets/*.css',
                        'public/assets/javascript/*.js',
                        'public/*.php',
                        'public/**/*.php',
                        'templates/*.html',
                        'templates/**/*.html'
                    ]
                },
                options: {
                    proxy: '<%= php.dist.options.hostname %>:<%= php.dist.options.port %>',
                    watchTask: true,
                    notify: true,
                    open: true,
                    logLevel: 'silent',
                    ghostMode: {
                        clicks: true,
                        scroll: true,
                        links: true,
                        forms: true
                    }
                }
            }
        },
        imagemin: {
            images: {
                options: {
                    optimizationLevel: 4,
                    progressive: true,
                    interlaced: true
                },
                files: [{
                        expand: true,
                        cwd: 'assets/images/',
                        src: ['**/*.{png,jpg,gif}'],
                        dest: 'public/assets/images/'
                    }]
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: [{
                    expand: true,
                    cwd: 'assets/stylesheets',
                    src: ['*.scss'],
                    // dest: './public/assets/stylesheets',
                    dest: '.tmp/sass/assets/stylesheets',
                    ext: '.css'
                }]
            }
        },
        copy: {
            fonts: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        cwd: 'assets/bower_components/bootstrap-sass/assets/fonts/bootstrap',
                        src: '**',
                        dest: 'public/assets/fonts'
                    },
                    {
                        expand: true,
                        cwd: 'assets/bower_components/components-font-awesome',
                        src: 'fonts/*',
                        dest: 'public/assets'
                    }                    
                ]
            },
            templatewrapper: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets/templates/include',
                        src: '**',
                        dest: 'templates/include'
                    }
                ]
            }
        },
        concat: {
            options: {
                separator: ';',
            },
            main_js: {
                src: ['./assets/javascript/main.js'],
                dest: './public/assets/javascript/main.js'
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            main_js: {
                files: {
                    './public/assets/javascript/main.js': './public/assets/javascript/main.js'
                }
            }
        },
        phpunit: {
            classes: {
                dir: 'tests/'   //location of the tests
            },
            options: {
                bin: 'vendor/bin/phpunit',
                colors: true,
                coverageHtml: 'coverage'
            }
        },
        // Automatically inject Bower components into the app
        wiredep: {
            options: {
                cwd: ''
            },
            app: {
                src: [
                    './assets/templates/include/header.html',
                    './assets/templates/include/footer.html'
                ],
                ignorePath:  /\.\.\/\.\.\//,
                exclude: [  'bower_components/components-font-awesome/css/font-awesome.css' ]
            }
        }, 
        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: [
                './assets/templates/include/header.html',
                './assets/templates/include/footer.html'
            ],
            options: {
                dest: './public',
                flow: {
                    html: {
                        steps: {
                            // js: ['concat', 'uglifyjs'],
                            js: ['concat'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        }, 
        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: [
                'templates/include/header.html',
                'templates/include/footer.html'
            ],
            css: ['public/assets/stylesheets/{,*/}*.css'],
            options: {
                assetsDirs: ['public/assets','public/assets/images','public/assets/fonts','public/assets/stylesheets','public/assets/javascript']
            }
        },
        watch: {
            js: {
                files: ['./assets/javascript/{,*/}*.js'],
                tasks: ['useminPrepare','concat:generated','uglify:generated'],
                options: {
                  livereload: true                        //reloads the browser
                }
            },
            sass: {
                files: ['./assets/stylesheets/*.scss', './assets/stylesheets/**/*.scss'], //watched files
                tasks: ['sass'], //tasks to run
                options: {
                    livereload: true                        //reloads the browser
                }
            },
            tests: {
                files: ['app/src/*.php'], //the task will run only when you save files in this location
                tasks: ['phpunit']
            },
            composer_json: {
                files: [
                    'composer.json',
                    'composer.lock'
                ],
                tasks: ['composer:update']
            },
            livereload: {
                options: {
                  livereload: true
                },
                files: [
                  'assets/{,*/}*.html',
                  'assets/stylesheets/{,*/}*.css',
                  'assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        }
    });


    // Task definition
    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', [
        'composer:update',
        'phpunit',
        'clean:build',
        'wiredep',
        'useminPrepare',
        'imagemin',
        'copy:fonts',
        'sass',
        'cssmin',
        'concat:generated',
        // 'uglify:generated',
        'clean:templatewrapper',
        'copy:templatewrapper',
        'usemin'
    ]);
    grunt.registerTask('serve', [
        'build',
        'php:dist', // Start PHP Server
        'browserSync:dist', // Using the php instance as a proxy
        'watch'             // Any other watch tasks you want to run
    ]);
};
