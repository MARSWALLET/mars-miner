import type React from "react"
import { motion } from "framer-motion"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface Miner {
  _id: string
  name: string
  hashPower: number
  price: number
  image: string
}

interface MinerCarouselProps {
  miners: Miner[]
  onBuy: (minerId: string) => void
}

const MinerCarousel: React.FC<MinerCarouselProps> = ({ miners, onBuy }) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      spaceBetween={30}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      className="miner-carousel"
    >
      {miners.map((miner) => (
        <SwiperSlide key={miner._id}>
          <motion.div whileHover={{ scale: 1.05 }} className="miner-card">
            <img src={miner.image || "/placeholder.svg"} alt={miner.name} className="miner-image" />
            <h3>{miner.name}</h3>
            <p>Hash Power: {miner.hashPower} HP</p>
            <p>Price: ₦{miner.price.toFixed(2)}</p>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onBuy(miner._id)}
              className="buy-button"
            >
              Buy
            </motion.button>
          </motion.div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default MinerCarousel

