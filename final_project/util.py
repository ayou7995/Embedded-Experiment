def rec_color(color, direct):
    factory_b = {'r':[2,0], 'g':[1,0], 'b':[0,0]}
    factory_f = {'r':[2,4], 'g':[1,4], 'b':[0,4]}
    goal = []

    if direct == 1:
        goal = factory_f[color]
    else:
        goal = factory_b[color]
    return goal


def turning(vec):
    # 7 for turning left, 8 for turning right
    direct = 0
    if vec[0]*vec[1]==1:
        direct = 8
    else:
        direct = 7
    return direct

def path_planning(myself, other):
    #7 for turning right, 8 for turning left, 9 for turning back
    #direction: -1 for (4,x) -> (0,x), 1 for (0,x) -> (4,x)
    tconst = 15
    pos, end = myself.pos, myself.goal
    diff = [end[0] - pos[0], end[1]-pos[1]]
    turn =7 
    last_turn_path = str(abs(diff[1])-1)+' '+str(turn)+' '+str(abs(diff[0]))+' '+str(15-turn)+' 1'
    first_turn_path = '1 '+str(turn)+' '+str(abs(diff[0]))+' '+str(15-turn)+' '+str(abs(diff[1])-1)

    if end[0] - pos[0] == 0:
        #straight path
        path = str(abs(diff[1]))
    else:
        if other.path == '': #if the ohter car is not moving
            if other.direct != myself.direct: #if the directions are opposite
                path = last_turn_path
            else: #if the directions are the same
                path = first_turn_path

        else: #if the other car is moving
            if other.direct != myself.direct:
                if other.goal[0] == myself.pos[0]:
                    path = first_turn_path
                else:
                    path = last_turn_path
            else:
                path = first_turn_path
    
    return path


def path2point(car):
    path = car.path.split()
    print('path in function:')
    print(path)
    f, r, l = [], [], []
    current, new = car.pos, []
    points = []

    if car.direct == 1:
        f,r,l = [0,1], [1,0], [-1,0]
    else:
        f,r,l = [0,-1], [-1,0], [1,0]
    
    move, rotate = path[::2], path[1::2]

    vec = f
    turn = 0
    for p in path:
        #print(p)
        if p in move:
            for i in range(int(p)):
                new = [current[0]+vec[0], current[1]+vec[1]]
                current = new
                points.append(new)
                #print(new)
        else:
            if int(p)==7 and turn%2==0:
                vec = l
                turn+=1
            elif int(p)==8 and turn%2==0:
                vec = r
                turn+=1
            elif int(p)==9:
                break
            else:
                vec=f

    
    return points


__all__ = [rec_color, path_planning, path2point]
