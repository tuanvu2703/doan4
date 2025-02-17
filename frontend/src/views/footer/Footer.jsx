import React from 'react'
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/16/solid'
import { Link } from 'react-router-dom'
const Footer = () => {
    return (
        <footer className="bg-[#023047] text-gray-300 w-full">
            <div className="max-w-6xl mx-auto px-4 py-10 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="mb-8 md:mb-0">
                        <Link to="/" className="text-2xl font-bold text-white">Logo</Link>
                        <p className="mt-4 text-sm">
                            Cung cấp giải pháp sáng tạo cho nhu cầu kinh doanh của bạn từ năm 2024.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Công ty</h3>
                        <ul className="space-y-2">
                            <li><Link to="/about" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
                            <li><Link to="/services" className="hover:text-white transition-colors">Dịch vụ</Link></li>
                            <li><Link to="/team" className="hover:text-white transition-colors">Đội ngũ</Link></li>
                            <li><Link to="/contact" className="hover:text-white transition-colors">Liên hệ</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Tài nguyên</h3>
                        <ul className="space-y-2">
                            <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                            <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            <li><Link to="/support" className="hover:text-white transition-colors">Hỗ trợ</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Theo dõi chúng tôi</h3>
                        <div className="grid gap-2">
                            <div className="hover:text-white transition-colors flex gap-2">
                                {/* <FaFacebook size={24} /> */}
                                <EnvelopeIcon className='size-7' />
                                <span className="">Email:</span>
                                <span>abc@gmail.com</span>
                            </div>
                            <div className="hover:text-white transition-colors flex gap-2">
                                {/* <FaFacebook size={24} /> */}
                                <PhoneIcon className='size-7' />
                                <span className="">Hotline:</span>
                                <span className="">113</span>
                            </div>

                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-800 text-sm text-center">
                    <p>&copy; {new Date().getFullYear()} Tên Công Ty FUCKING NEMO. Đã đăng ký bản quyền.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer