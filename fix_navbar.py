import re

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Replace Home logo
content = content.replace(
    '''        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
          onClick={() => setCurrentView("home")}
        >
          <LogoImage className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
          <div className="flex items-center gap-0">
            <span className="text-[#39FF14] font-black text-lg sm:text-xl md:text-2xl tracking-tighter">
              Movie
            </span>
            <span className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tighter">
              Vibe
            </span>
          </div>
        </div>''',
    '''        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0"
        >
          <LogoImage className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md" />
          <div className="flex items-center gap-0">
            <span className="text-[#39FF14] font-black text-lg sm:text-xl md:text-2xl tracking-tighter">
              Movie
            </span>
            <span className="text-white font-black text-lg sm:text-xl md:text-2xl tracking-tighter">
              Vibe
            </span>
          </div>
        </Link>'''
)

# Replace Desktop Nav Links
content = content.replace(
    '''        <div className="hidden lg:flex items-center gap-3 xl:gap-6 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`relative font-medium transition-colors hover:text-white whitespace-nowrap shrink-0 overflow-hidden group ${
                currentView === item.view ? "text-white" : "text-gray-400"
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-brand-600 transition-transform duration-300 origin-left ${currentView === item.view ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </button>
          ))}
        </div>''',
    '''        <div className="hidden lg:flex items-center gap-3 xl:gap-6 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.view}
              href={item.view === 'home' ? '/' : `/${item.view}`}
              className={`relative font-medium transition-colors hover:text-white whitespace-nowrap shrink-0 overflow-hidden group ${
                currentView === item.view ? "text-white" : "text-gray-400"
              }`}
            >
              {item.label}
              <span className={`absolute bottom-0 left-0 w-full h-[2px] bg-brand-600 transition-transform duration-300 origin-left ${currentView === item.view ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </Link>
          ))}
        </div>'''
)

# Replace Mobile Menu Nav Links
content = content.replace(
    '''            <div className="flex-1 overflow-y-auto py-8 flex flex-col justify-center items-center gap-3 px-6 pb-24">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      setCurrentView(item.view);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full max-w-[280px] py-4 px-6 rounded-2xl font-bold transition-all duration-300 text-lg flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in fill-mode-both ${
                      currentView === item.view
                        ? "text-white bg-brand-600/20 text-brand-500 shadow-[0_0_20px_rgba(220,38,38,0.15)] border border-brand-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${currentView === item.view ? 'text-brand-500' : 'text-gray-500'}`} />
                    {item.label}
                  </button>
                );
              })}''',
    '''            <div className="flex-1 overflow-y-auto py-8 flex flex-col justify-center items-center gap-3 px-6 pb-24">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.view}
                    href={item.view === 'home' ? '/' : `/${item.view}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full max-w-[280px] py-4 px-6 rounded-2xl font-bold transition-all duration-300 text-lg flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in fill-mode-both ${
                      currentView === item.view
                        ? "text-white bg-brand-600/20 text-brand-500 shadow-[0_0_20px_rgba(220,38,38,0.15)] border border-brand-500/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${currentView === item.view ? 'text-brand-500' : 'text-gray-500'}`} />
                    {item.label}
                  </Link>
                );
              })}'''
)

# Replace Mobile Bottom Nav Bar
content = content.replace(
    '''        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view && !isMobileMenuOpen;
          return (
            <button
              key={item.view}
              onClick={() => {
                setIsMobileMenuOpen(false);
                setCurrentView(item.view);
              }}
              className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 flex-1 h-[56px] z-10 outline-none group`}
            >
              <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${isActive ? '-translate-y-1.5' : 'translate-y-0'}`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isActive ? "text-brand-500" : "text-gray-400 group-hover:text-gray-300"}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-black tracking-widest transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full text-center absolute bottom-1 ${isActive ? 'text-brand-500 opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-4 scale-75'}`}>
                {item.label}
              </span>
            </button>
          );
        })}''',
    '''        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view && !isMobileMenuOpen;
          return (
            <Link
              key={item.view}
              href={item.view === 'home' ? '/' : `/${item.view}`}
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              className={`relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 flex-1 h-[56px] z-10 outline-none group`}
            >
              <div className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${isActive ? '-translate-y-1.5' : 'translate-y-0'}`}>
                <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300 ${isActive ? "text-brand-500" : "text-gray-400 group-hover:text-gray-300"}`} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-black tracking-widest transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full text-center absolute bottom-1 ${isActive ? 'text-brand-500 opacity-100 translate-y-0 scale-100' : 'text-gray-500 opacity-0 translate-y-4 scale-75'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}'''
)

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)

print("Navbar.tsx updated")
