<style>
.user{
    position: relative;
    border-radius: 5px;
    background: rgba(255, 255, 255, 1);
    margin: 0 20px;
    margin-bottom: 80px;
    padding-top: 5px;
    padding-bottom: 30px;
    max-width: 300px;
    color: #707070;
  }
  .picture{
    height: 65px;
    width: 65px;
    border-radius: 100px;
    background: #f2fdff;
    position: absolute;
    top: -32.5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 35px;
  }
  .picture > .fas {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .data{
    margin: auto;
    padding: 0 30px;
    padding-top: 10px;
    width: max-content;
  }

  .unsynced{
    background-color: rgb(108, 108, 108);
    color: white;
  }
  .unsynced > p {
    padding: 10px 0;
    width: max-content;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
  .btn-remove{
    background-color: #dc3545;
    padding: 10px 20px;
    border: none;
    color: white;
    font-weight: 600;
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%, 50%);
    border-radius: 5px;
    box-shadow: 3px 3px 8px 3px rgba(0, 0, 0, 0.2);
  }
  .name {
    font-weight: 200;
    margin-bottom: 0;
  }
</style>

<div class="user">
  <div class="picture"><i class="fas fa-plus"></i></div>
  <div class="data min">
    <h2 class="name">Add User</h2>
    
  </div>

</div>

<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()
</script>