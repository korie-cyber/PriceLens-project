
    @echo off
    setlocal
    rem Build for Windows
    javac -cp gson-2.8.9.jar;. *.java -d out
    if errorlevel 1 (
        echo Compile failed.
        exit /b 1
    )
    jar cfm PriceLensBackend.jar manifest.txt -C out .
    if errorlevel 1 (
        echo JAR packaging failed.
        exit /b 1
    )
    echo Build OK: PriceLensBackend.jar
