import React from 'react'

const Header = () => {
    return (
        <div>
            <header>
                <div className="flex h-20 w-full shrink-0 items-center justify-between px-4 md:px-6 relative">
                    <div className='flex justify-start items-center'>
                        <img src='/logo.png' alt='logo' height={30} width={30} />
                        <span className="ms-3 text-2xl text-transparent bg-clip-text inline-block bg-gradient-to-r from-orange-600 to-blue-400">NeoVar</span>
                    </div>
                    <div>
                        <button className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded'>
                            Log Out
                        </button>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default Header

