#!/bin/bash

# Portfolio Manager - Server Management Script
# Používej tento script pro snadné ovládání lokálního serveru

echo "🚀 Portfolio Manager - Server Manager"
echo "====================================="
echo ""

# Funkce pro kontrolu, jestli server běží
check_server() {
    if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Server BĚŽÍ na http://localhost:8080"
        return 0
    else
        echo "❌ Server NEBĚŽÍ"
        return 1
    fi
}

# Funkce pro spuštění serveru
start_server() {
    if check_server; then
        echo "⚠️  Server už běží!"
        return 1
    fi
    
    echo "🚀 Spouštím server..."
    cd "$(dirname "$0")"
    
    # Spusť server na pozadí
    nohup python3 -m http.server 8080 > server.log 2>&1 &
    SERVER_PID=$!
    
    echo $SERVER_PID > .server.pid
    
    sleep 1
    
    if check_server; then
        echo "✅ Server úspěšně spuštěn (PID: $SERVER_PID)"
        echo "📂 URL: http://localhost:8080"
        echo "📝 Logy: server.log"
        return 0
    else
        echo "❌ Nepodařilo se spustit server"
        return 1
    fi
}

# Funkce pro zastavení serveru
stop_server() {
    echo "🛑 Zastavuji server..."
    
    # Pokus se najít PID ze souboru
    if [ -f .server.pid ]; then
        PID=$(cat .server.pid)
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            echo "✅ Server zastaven (PID: $PID)"
            rm .server.pid
            return 0
        fi
    fi
    
    # Fallback: Najdi proces podle portu
    PID=$(lsof -ti:8080)
    if [ -n "$PID" ]; then
        kill $PID
        echo "✅ Server zastaven (PID: $PID)"
        return 0
    fi
    
    echo "ℹ️  Server neběží"
    return 1
}

# Funkce pro restart serveru
restart_server() {
    echo "🔄 Restartuji server..."
    stop_server
    sleep 1
    start_server
}

# Funkce pro otevření aplikace
open_app() {
    if ! check_server; then
        echo "⚠️  Server neběží, spouštím..."
        start_server
        sleep 2
    fi
    
    echo "🌐 Otevírám aplikaci v Safari..."
    open -a Safari "http://localhost:8080/investPortfolio.html"
}

# Funkce pro otevření debug stránky
open_debug() {
    if ! check_server; then
        echo "⚠️  Server neběží, spouštím..."
        start_server
        sleep 2
    fi
    
    echo "🔍 Otevírám debug stránku v Safari..."
    open -a Safari "http://localhost:8080/test-debug.html"
}

# Funkce pro zobrazení logů
show_logs() {
    if [ -f server.log ]; then
        echo "📝 Poslední logy serveru:"
        echo "========================"
        tail -n 20 server.log
    else
        echo "❌ Log soubor nenalezen"
    fi
}

# Menu
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        check_server
        ;;
    open)
        open_app
        ;;
    debug)
        open_debug
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Použití: $0 {start|stop|restart|status|open|debug|logs}"
        echo ""
        echo "Příkazy:"
        echo "  start   - Spustit server"
        echo "  stop    - Zastavit server"
        echo "  restart - Restartovat server"
        echo "  status  - Zkontrolovat stav serveru"
        echo "  open    - Otevřít aplikaci v Safari"
        echo "  debug   - Otevřít debug stránku"
        echo "  logs    - Zobrazit logy serveru"
        echo ""
        echo "Příklady:"
        echo "  ./server.sh start    # Spustí server"
        echo "  ./server.sh open     # Spustí server a otevře aplikaci"
        echo "  ./server.sh stop     # Zastaví server"
        exit 1
        ;;
esac
