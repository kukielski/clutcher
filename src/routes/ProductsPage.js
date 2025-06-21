import React from 'react';
import './ProductsPage.css'; // Create this file for styles

const products = [
  { title: 'Vanilla Tallow Balm', description: 'Premium whipped beef tallow balm.', price: '$12.99' },
  { title: 'Vanilla Extract', description: 'Pure & organic vanilla extract for baking.', price: '$8.99' },
  { title: 'Vanilla Body Butter', description: 'Beef tallow body butter with a rich vanilla scent.', price: '$10.99' },
  { title: 'Rejuvenating Lip Balm', description: 'Nourishing lip balm to rejuvenate and protect your lips.', price: '$6.99' },
  { title: 'Hair Growth Serum', description: 'A serum designed to promote healthy hair growth and strength.', price: '$7.99' },
  { title: 'Lucious Lashes Growth Oil', description: 'Natural oil blend to support longer, fuller lashes.', price: '$9.99' },
  { title: 'Vanilla Paste', description: 'Rich vanilla paste perfect for baking and desserts.', price: '$14.99' },
  { title: 'Body Balm: Vanilla Shea Butter', description: 'Moisturizing body balm made with shea butter and vanilla.', price: '$11.99' },
  { title: 'Body Balm: Vanilla Mango Butter', description: 'Hydrating body balm with mango butter and vanilla aroma.', price: '$3.99' },
  { title: 'Vanilla Candles', description: 'Hand-poured candles with a warm vanilla fragrance.', price: '$5.99' },
  { title: 'Vanilla Sugar', description: 'Sweet vanilla-infused sugar for baking and beverages.', price: '$4.99' },
  { title: 'Exfoliating Body Scrub: Vanilla', description: 'Gentle body scrub with vanilla to exfoliate and soften skin.', price: '$13.99' },
  { title: 'Shea Butter Soap: Vanilla', description: 'Creamy shea butter soap with a soothing vanilla scent.', price: '$13.99' },
  { title: 'Shea Butter Soap: Vanilla Chamomile', description: 'Relaxing soap with shea butter, vanilla, and chamomile.', price: '$13.99' },
  { title: 'Deodorant: Vanilla Donut', description: 'Natural deodorant with a sweet vanilla donut aroma.', price: '$13.99' },
];

export default function ProductsPage() {
  return (
    <div className="products-container">
      <h1>Products</h1>
      <div className="products-grid">
        {products.map((product, idx) => (
          <div className="product-card" key={idx}>
            <div className="product-image-placeholder">No Image</div>
            <h2 className="product-title">{product.title}</h2>
            <p className="product-description">{product.description}</p>
            <div className="product-price">{product.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}