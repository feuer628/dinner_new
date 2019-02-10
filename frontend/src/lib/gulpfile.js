var gulp = require('gulp');
var concat = require('gulp-concat');


function scripts() {
    return gulp.src([ // Берем все необходимые библиотеки
        'require/require.js',
        'vue/vue.js',
        'vue/vue-router.js',
        // 'vue/vue-meta.js',
        'vue/vue-class-component.js',
        'tslib/tslib.js',
        'axios/axios.js',
        'bootstrap/bootstrap-vue.js',
        // 'bootstrap/bootstrap-vue.esm.js'
    ])
        .pipe(concat('lib.js')) // Собираем их в кучу в новом файле libs.js
        // .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('C:/tools/tomcat/webapps/ROOT/lib')); // Выгружаем в папку dest/js
}

gulp.task('default', scripts);
