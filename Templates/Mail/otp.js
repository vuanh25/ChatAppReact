module.exports = (name, otp) => {
  return `
  <!DOCTYPE html>
  <html lang=""en"">
  <head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <style>
      :root {{
        --panel-color: rgba(0, 0, 0, 0.135);
        --title-color: rgba(37, 47, 61, 1);
        --panel-border-width: 0.1em;
        --panel-padding: 0.75em;
      }}

      .panel {{
        background: var(--panel-color);
        border-radius: var(--panel-border-width);
        padding: var(--panel-border-width);
      }}
      .panel__header {{
          background: var(--title-color);
      }}
      .panel__header, 
      .panel__content {{
        padding: var(--panel-padding);
      }}

      .panel__title {{
        line-height: 1;
        font-family: Montserrat;
      }}

      .panel__content {{
        padding: 12px 22px;
        background: #fff;
      }}

      .example {{
        display: flex;
        flex-grow: 1;
        padding: 1em max(1em, calc(50vw - 60ch));
        place-items: center;
      }}

      .example > * {{
        flex-grow: 1;
      }}

      .bg-1 {{
        background-image: radial-gradient( circle farthest-corner at 1.5% 1.4%,  rgba(159,227,255,1) 0%, rgba(255,177,219,1) 100.2% );
      }}
    </style>
  </head>
  <body>
    <div class=""example bg-1"">
      <section class=""panel"">
        <header class=""panel__header"">
          <h1 class=""panel__title"" style=""text-align: center"">
            Chat App
          </h1>
        </header>
        <div class=""panel__content"" style=""font-family: Montserrat; font-size: 14px;"">
          Chúng tôi đã nhận yêu cầu xác thực tài khoản web <strong>ChatApp</strong> của bạn. Mã dùng một lần của bạn là:
          <br>
          <div style=""font-size: 4em; text-align: center"">
            ${otp}
          </div>
          <hr>
          <div style=""padding-top: 12px; text-align: center; font-family: Montserrat"">
          Chúng tôi sẽ không bao giờ gửi email cho bạn và yêu cầu bạn tiết lộ hoặc xác minh mật khẩu, thẻ tín dụng hoặc số tài khoản ngân hàng của bạn.
          </div>
        
      </section>
    </div>
  </body>
  </html>
      `;
};
