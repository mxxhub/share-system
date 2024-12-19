import styled from "styled-components";

export const HeaderStyle = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  a {
    text-decoration: none;
    color: white;
  }
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    img {
      width: 40px;
      height: 40px;
    }

    @media screen and (max-width: 960px) {
      width: auto;
      span {
        display: none;
      }
    }
  }

  .nav-right {
    display: flex;
    align-items: center;
    justify-content: center;
    button {
      background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
      padding: 15px 30px;
      border-radius: 30px;
      color: white;
      outline: none;
      font-size: 20px;
      border: none;

      &:hover {
        opacity: 0.8;
        cursor: pointer;
      }
      @media screen and (max-width: 960px) {
        width: 100%;
        font-size: 16px;
      }
    }
    @media screen and (max-width: 960px) {
    }
  }

  @media screen and (max-width: 960px) {
    /* height: 140px; */
  }
`;

export const HomeContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 30px;
  min-height: 100vh;
  .flex {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .gap-20 {
    gap: 20px;
  }

  .gap-10 {
    gap: 10px;
  }

  .token {
    border: 1px solid var(--pink);
    border-radius: 15px;
    padding: 10px 20px;
    width: auto;

    &:hover {
      background-color: rgba(96, 32, 160, 0.2);
      cursor: pointer;
    }
    @media screen and (max-width: 768px) {
      padding: 5px 10px;
      span {
        font-size: 14px;
      }
    }
  }

  .token-item {
    background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
    padding: 10px 20px;
    border-radius: 30px;
    width: 100%;
    &:hover {
      opacity: 0.8;
      cursor: pointer;
    }

    @media screen and (max-width: 768px) {
      padding: 5px 10px;
      img {
        width: 20px;
        height: 20px;
      }

      .token-name {
        font-size: 16px;
      }
    }
  }

  .wave1,
  .wave2 {
    position: absolute;
    opacity: 0.5;
    width: 700px;
    height: auto;
    @media screen and (max-width: 576px) {
      width: 100%;
    }
  }

  .wave1 {
    bottom: 0;
    left: 0;
    transform: translate(-30%, 50%);
    /* opacity: .5; */
  }

  .wave2 {
    top: 0;
    right: 0;
    opacity: 0.5;
    transform: translate(0, 30%);
  }

  @media screen and (max-width: 960px) {
    /* height: calc(100vh - 140px); */
  }
`;

export const Main = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
  color: white;
  width: 100%;
  height: 100%;

  .connect-wallet {
    font-size: 20px;
    background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
    color: white;
    padding: 20px 40px;
    font-weight: 600;
    border-radius: 40px;
  }

  .static-info {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    flex: auto;
    gap: 20px;
    .info {
      background: linear-gradient(
        120deg,
        #01011b 23.5%,
        rgba(96, 32, 160, 0.6) 100%
      );
      border: 1px solid var(--pink);
      border-radius: 20px;
      display: flex;
      flex: 1 33.33%;
      flex-direction: column;
      justify-content: space-between;
      align-items: left;

      & h1 {
        font-size: 2.5rem;
        @media screen and (max-width: 960px) {
          font-size: 2.5rem;
        }

        @media screen and (max-width: 576px) {
          font-size: 2rem;
        }
      }

      @media screen and (max-width: 960px) {
        flex: 1 50%;
      }

      @media screen and (max-width: 576px) {
        flex: 1 100%;
      }
    }
  }

  section {
    display: flex;
    flex-direction: column;
    width: 700px;
    background: linear-gradient(
      180deg,
      #01011b 23.5%,
      rgba(96, 32, 160, 0.6) 100%
    );
    border-radius: 20px;
    gap: 30px;
    padding: 40px;
    border: 1px solid var(--pink);

    & > div:first-of-type {
      justify-content: center;
      .checkbox {
        position: relative;
        display: flex;
        /* background-image: radial-gradient(#6020A0 75%, #006FEE); */
        width: 300px;
        height: 60px;
        border-radius: 30px;
        border: 1px solid var(--pink);
        padding: 2px;
        button {
          position: absolute;
          border-radius: 30px;
          width: 150px;
          background-color: transparent;
          border: 1px solid transparent;
          color: white;
          font-size: 18px;
          transition: all 0.3s;
          cursor: pointer;

          &:first-of-type,
          &:last-of-type {
            top: 0;
            margin: 2px;
            height: calc(100% - 4px);
          }

          &:first-of-type {
            left: 0;
          }

          &:last-of-type {
            right: 0;
          }

          &.active {
            background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
          }

          &.active:hover {
            opacity: 0.8;
          }

          &:not(.active):hover {
            background-color: rgba(255, 255, 255, 0.05);
          }

          @media screen and (max-width: 960px) {
            width: 150px;
          }

          @media screen and (max-width: 576px) {
            width: 125px;
          }
        }

        @media screen and (max-width: 960px) {
          width: 300px;
          height: 40px;
        }

        @media screen and (max-width: 576px) {
          width: 250px;
        }
      }

      @media screen and (max-width: 960px) {
        margin-top: 40px;
      }
    }

    .input-box {
      flex-direction: column;
      gap: 30px;
      & > div {
        font-weight: bold;
      }
      .stake {
        border: 1px solid var(--pink);
        width: 100%;
        height: 100%;
        border-radius: 30px;
        padding: 10px;
        input {
          width: 90%;
          height: 100%;
          background-color: transparent;
          outline: none;
          border: none;
          color: white;
          font-size: 30px;
          padding: 15px;

          @media screen and (max-width: 960px) {
            width: 100%;
          }
        }

        & > div {
          position: relative;
          padding: 10px;
          height: 100%;
          gap: 10px;

          & > div {
            flex-direction: column;
            align-items: flex-end;
            font-weight: bold;
            & > span:first-of-type {
              font-size: 20px;
              @media screen and (max-width: 960px) {
                font-size: 16px;
              }
            }

            & > span:first-of-type {
              padding: 5px 15px;
              color: gray;
              &:hover {
                cursor: pointer;
                color: white;
                background-color: var(--pink);
                border-radius: 20px;
              }
            }

            & span:last-of-type {
              color: gray;
              padding-right: 15px;
            }

            @media screen and (max-width: 960px) {
              align-items: center;
              width: auto;
            }
          }
          & > img:last-child {
            position: absolute;
            right: 10px;
            @media screen and (max-width: 960px) {
              right: 30px;
            }
          }

          &:hover {
            opacity: 0.8;
          }

          @media screen and (max-width: 960px) {
            width: 100%;
            justify-content: center;
            padding: 0;
          }
        }

        @media screen and (max-width: 960px) {
          flex-direction: column;
        }
      }

      .stake-info {
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 20px;
        gap: 10px;
        & .info {
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: space-between;

          & span {
            font-size: 16px;
          }
        }
      }
    }

    .arrow-down {
      justify-content: center;
      & > div {
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(
          0,
          #01011b 23.5%,
          rgba(96, 32, 160, 0.6) 100%
        );
        border-radius: 12px;
        margin-bottom: -20px;
      }
    }
    .input-addr {
      input {
        width: 100%;
        padding: 20px;
        background-color: transparent;
        border: 1px solid var(--pink);
        border-radius: 30px;
        font-size: 20px;
        color: white;
        outline: none;
      }
    }

    .swap-btn {
      width: 100%;
      justify-content: center;
      button {
        width: 100%;
        background: linear-gradient(90deg, #6020a0 0%, #006fee 100%);
        width: 50%;
        padding: 15px 0;
        border-radius: 30px;
        color: white;
        outline: none;
        font-size: 20px;
        border: none;

        &:hover {
          opacity: 0.8;
          cursor: pointer;
        }
        @media screen and (max-width: 960px) {
          width: 100%;
        }
      }
    }

    @media screen and (max-width: 960px) {
      width: 550px;
      gap: 15px;
    }

    @media screen and (max-width: 768px) {
      width: calc(100% - 40px);
      margin: 0 20px;
    }
  }
`;
