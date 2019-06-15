const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');

function uglifyIndex() {
    return gulp.src(['src/lib/index.js']).pipe(uglify()).pipe(gulp.dest("./target/result/lib"));
}

function prodactionScripts() {
    return gulp.src([ // Берем все необходимые библиотеки
        'src/lib/require/require.js',
        'src/lib/vue/vue.min.js',
        'src/lib/vue/vue-router.min.js',
        // 'vue/vue-meta.js',
        'src/lib/vue/vue-class-component.min.js',
        'src/lib/tslib/tslib.js',
        'src/lib/axios/axios.js',
        'src/lib/bootstrap/bootstrap-vue.js',
    ])
        .pipe(concat('lib.js')) // Собираем их в кучу в новом файле libs.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('./target/result/lib')); // Выгружаем в папку
}

function dev() {
    return gulp.src([ // Берем все необходимые библиотеки
        'src/lib/require/require.js',
        'src/lib/vue/vue.js',
        'src/lib/vue/vue-router.js',
        // 'vue/vue-meta.js',
        'src/lib/vue/vue-class-component.js',
        'src/lib/tslib/tslib.js',
        'src/lib/axios/axios.js',
        'src/lib/bootstrap/bootstrap-vue.js',
    ])
        .pipe(concat('lib.js')) // Собираем их в кучу в новом файле libs.js
        .pipe(gulp.dest('C:/tools/tomcat/webapps/ROOT/lib')); // Выгружаем в папку
}

/**
 * Сборка скриптов внешних зависимостей для режима разработки
 */
gulp.task('default', dev);

/**
 * Сборка скриптов внешних зависимостей для релиза
 */
gulp.task('release', prodactionScripts);

/**
 * Обфускация index.js
 */
gulp.task('uglify-index', uglifyIndex);
